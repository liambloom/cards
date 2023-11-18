import { Card } from "../common/cards.js";

export interface Skin {
    get cardWidth(): number;
    get cardHeight(): number;
    get minValueVisibleWidth(): number;
    get minValueVisibleHeight(): number;

    drawCard(card: Card, position: NewPos): HitBox;
}

export const DEBUG_SKIN: Skin = {
    cardWidth: 1,
    cardHeight: 1,
    minValueVisibleHeight: 1,
    minValueVisibleWidth: 1,

    drawCard(card: Card, position: NewPos): HitBox {
        console.log(`${card.faceUp ? (card.face.value.symbol + card.face.suit.symbol) : "??"} @ Position (${position.x}, ${position.y})`);
        return new HitBox([new Rectangle(position, this.cardWidth, this.cardHeight)]);
    }
} as const;

export class NewPos {
    public constructor(public readonly x: number, public readonly y: number) { }

    public equals(other: NewPos) {
        return this.x === other.x && this.y === other.y;
    }
}

// TODO: Just have element do this. When a click happens, call something on the table, that
// passes it down like this, WITHOUT

export class HitBoxEvent {
    public constructor(
        public readonly target: Element,
        public readonly currentTarget: Element,
    ) {}
}

interface HitBoxTreeElement {
    getTarget(pos: NewPos, callback: (e: HitBoxEvent) => void): Element | null;
}

export class HitBoxTree implements HitBoxTreeElement {
    public constructor(public readonly children: ReadonlyArray<HitBoxTreeElement>) {

    }
    

    public getTarget(pos: NewPos, callback: (e: HitBoxEvent) => void): Element | null {

    }

}
export class Rectangle implements HitBoxTreeElement {
    public constructor(
        public readonly subject: Element,
        public readonly pos: NewPos, 
        public readonly width: number, 
        public readonly height: number
    ) {
    }

    public getTarget(pos: NewPos, callback: (e: HitBoxEvent) => void): Element | null {
        if (pos.x >= this.pos.x 
            && pos.y >= this.pos.y
            && pos.x <= this.pos.x + this.width
            && pos.y <= this.pos.y + this.height) {
            callback(new HitBoxEvent(this.subject, this.subject))

            return this.subject;
        }
        return null;  
    }
}


export type PositionTreeUpdateListener = (start: number, end: number) => void;

export abstract class Element {
    protected latest: NewPos = new NewPos(-1, -1);

    public get latestPosition() {
        return this.latest;
    }

    abstract draw(skin: Skin, pos: NewPos): HitBox;
}

export abstract class Parent<C extends Element> extends Element {
    protected childPositions: NewPos[] = [];
    private readonly updateListeners: PositionTreeUpdateListener[] = [];

    constructor(public readonly children: C[] = []) {
        super();
    }

    protected updateChildPositions(start: number = 0, end: number = this.children.length): void {
        this.childPositions = this.childPositions.slice(start, this.children.length);

        for (let listener of this.updateListeners) {
            listener(start, end);
        }
    }

    public addUpdateListener(callback: PositionTreeUpdateListener): void {
        this.updateListeners.push(callback);
    }

    public removeUpdateListener(callback: PositionTreeUpdateListener): boolean {
        const index = this.updateListeners.indexOf(callback);
        if (index === -1) {
            return false;
        }
        this.updateListeners.splice(index, 1);
        return true;
    }

    public override draw(skin: Skin, pos: NewPos) {
        if (!pos.equals(this.latest)) {
            this.childPositions = [];
        }
        this.latest = pos;

        let hitbox = new HitBox([]);
        for (let i = 0; i < this.children.length; i++) {
            if (this.childPositions[i] === undefined) {
                this.childPositions[i] = this.calculateChildPosition(i, skin);
            }

            hitbox = hitbox.union(this.children[i].draw(skin, this.childPositions[i]));
        }
        return hitbox;
    }

    /// This is calculated for each element in the tree lazily, depth-first. It can only be reliable called
    /// during a call to the draw() method. Because it is depth-first, earlier children, earlier siblings, and
    /// children of those siblings will be accurate if you call this method during the drawing process.
    public abstract calculateChildPosition(index: number, skin: Skin): NewPos;
}