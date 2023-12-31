import { Card } from "../common/cards.js";

export interface Skin {
    get cardWidth(): number;
    get cardHeight(): number;
    get minValueVisibleWidth(): number;
    get minValueVisibleHeight(): number;
    get ctx(): CanvasRenderingContext2D;
}

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
        public readonly targetStack: Element[],
    ) {}
}

export interface HitBox {
    checkHit(pos: NewPos): boolean;
}

export class Rectangle {
    public constructor(
        public readonly pos: NewPos, 
        public readonly width: number, 
        public readonly height: number
    ) {
    }

    public checkHit(pos: NewPos): boolean {
        return pos.x >= this.pos.x 
            && pos.y >= this.pos.y
            && pos.x <= this.pos.x + this.width
            && pos.y <= this.pos.y + this.height
    }
}


export type PositionTreeUpdateListener = (start: number, end: number) => void;

export abstract class Element {
    protected latest: NewPos = new NewPos(-1, -1);

    public get latestPosition(): NewPos {
        return this.latest;
    }

    public abstract maybeClick(pos: NewPos, callback: (e: HitBoxEvent) => void, targetStack: Element[]): Element[] | null;

    abstract draw(skin: Skin, pos: NewPos): void;
}

export abstract class Parent<C extends Element> extends Element {
    protected childPositions: NewPos[] = [];
    private readonly updateListeners: PositionTreeUpdateListener[] = [];

    constructor(public readonly children: C[] = []) {
        super();
    }

    public updateChildPositions(start: number = 0, end: number = this.children.length): void {
        // let insert: NewPos[] = [];
        // insert.length = end - start;
        // this.childPositions = this.childPositions.splice(start, end - start, ...insert);
        this.childPositions = this.childPositions.slice(0, start);

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
        if (!pos.equals(this.latestPosition)) {
            this.childPositions.length = 0;
        }
        this.latest = pos;

        for (let i = 0; i < this.children.length; i++) {
            this.childPositions[i] ??= this.calculateChildPosition(i, skin);
            this.children[i]?.draw(skin, this.childPositions[i]);
        }
    }

    public override maybeClick(pos: NewPos, callback: (e: HitBoxEvent) => void, targetStack: Element[]): Element[] | null {
        for (let i = this.children.length - 1; i >= 0; i--) {
            const hit = this.children[i].maybeClick(pos, callback, [this, ...targetStack]);
            if (hit !== null) {
                callback(new HitBoxEvent(hit[0], this, hit));
                return hit;
            }
        }
        return null;
    }

    public getChildPosition(index: number, skin: Skin): NewPos {
        return this.childPositions[index] ?? this.calculateChildPosition(index, skin);
    }

    /// This is calculated for each element in the tree lazily, depth-first. It can only be reliable called
    /// during a call to the draw() method. Because it is depth-first, earlier children, earlier siblings, and
    /// children of those siblings will be accurate if you call this method during the drawing process.
    public abstract calculateChildPosition(index: number, skin: Skin): NewPos;
}

export class HoldingParent<T extends Element> extends Parent<T> {
    public constructor(private readonly child: T) {
        super(new Proxy([], {
            defineProperty(target, prop, descriptor) {
                if (typeof prop === "string" && prop === "" + parseInt(prop) && (prop !== "0" || !(descriptor.value === child || typeof descriptor.get == "function" && descriptor.get() === child))) {
                    throw new Error("HoldingParent is mean to hold one specific child in index 0, cannot add other children or children in other places");
                }
                return Reflect.defineProperty(target, prop, descriptor);
            }
        }));
    }

    public override calculateChildPosition(index: number, skin: Skin): NewPos {
        return this.child.latestPosition;
    }
}