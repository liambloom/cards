import { Card } from "../common/cards.js";

export interface Skin {
    get cardWidth(): number;
    get cardHeight(): number;
    get minValueVisibleWidth(): number;
    get minValueVisibleHeight(): number;

    drawCard(card: Card, position: NewPos): void;
}

export const DEBUG_SKIN: Skin = {
    cardWidth: 1,
    cardHeight: 1,
    minValueVisibleHeight: 1,
    minValueVisibleWidth: 1,

    drawCard(card: Card, position: NewPos): void {
        console.log(`${card.faceUp ? (card.face.value.symbol + card.face.suit.symbol) : "??"} @ Position (${position.x}, ${position.y})`);
    }
} as const;

export abstract class Skinnable {
    abstract draw(skin: Skin, pos: NewPos): void;
}

export class NewPos {
    public constructor(public readonly x: number, public readonly y: number) { }

    public equals(other: NewPos) {
        return this.x === other.x && this.y === other.y;
    }
}

// export type PositionUpdateListener = (oldValue: [number, number], newValue: [number, number]) => void;

// export class Position {
//     private xVal: number | undefined;
//     private yVal: number | undefined;    
//     private xCalc: () => number = () => 0;
//     private yCalc: () => number = () => 0;
//     private updateListeners: PositionUpdateListener[] = [];

//     public constructor();
//     public constructor(x: number | (() => number), y: number | (() => number));
//     public constructor(pos: () => [number, number]);
//     public constructor(a?: number | (() => number) | (() => [number, number]), b?: number | (() => number)) {
//         if (a === undefined) {
//             this.setPosition(0, 0);
//         }
//         else {
//             // @ts-ignore
//             this.setPosition(a, b);
//         }
//     }

//     public get x(): number {
//         if (this.xVal === undefined) {
//             this.xVal = this.xCalc();
//         }
//         return this.xVal;
//     }

//     public get y(): number {
//         if (this.yVal === undefined) {
//             this.yVal = this.yCalc();
//         }
//         return this.yVal;
//     }

//     public set x(value: number | (() => number)) {
//         this.xVal = this.xCalc();

//         if (typeof value === "number") {
//             this.xCalc = () => value;
//         }
//         else {
//             this.xCalc = value;
//         }

//         this.update();
//     }

//     public set y(value: number | (() => number)) {
//         this.yVal = this.yCalc();

//         if (typeof value === "number") {
//             this.yCalc = () => value;
//         }
//         else {
//             this.yCalc = value;
//         }

//         this.update();
//     }

//     public get coordinates() {
//         return [this.x, this.y];
//     }

//     public set coordinates([x, y]: [number, number]) {
//         this.setPosition(x, y);
//     }

//     public setPosition(x: number | (() => number), y: number | (() => number)): void;
//     public setPosition(pos: () => [number, number]): void;
//     public setPosition(a: number | (() => number) | (() => [number, number]), b?: number | (() => number)): void {
//         if (b === undefined) {
//             this.x = () => {
//                 const [x, y] = (a as (() => [number, number]))();
//                 this.yVal = y;
//                 return x;
//             }
//             this.y = () => {
//                 const [x, y] = (a as (() => [number, number]))();
//                 this.xVal = x;
//                 return y;
//             }
//         }
//         else {
//             this.x = a as number | (() => number);
//             this.y = b;
//         }
//     }

//     public update() {
//         const [oldX, oldY] = [this.x, this.y];
//         this.xVal = this.yVal = undefined;

//         if (this.updateListeners.length > 0) {
//             const [newX, newY] = [this.x, this.y];
    
//             for (let listener of this.updateListeners) {
//                 listener([oldX, oldY], [newX, newY]);
//             }
//         }
//     }

//     public addUpdateListener(listener: PositionUpdateListener) {
//         this.updateListeners.push(listener);
//     }

//     public removeUpdateListener(listener: PositionUpdateListener) {
//         const index = this.updateListeners.indexOf(listener);
//         if (index !== -1) {
//             this.updateListeners.splice(index, 1);
//             return true;
//         }
//         return false;
//     }
// }

export type PositionTreeUpdateListener = (start: number, end: number) => void;

export interface PositioningData<C> {
    ownPosition: NewPos, 
    index: number, 
    child: C,
    skin: Skin,
}

export abstract class PositionTree<C extends Skinnable> extends Skinnable {
    // public readonly position: Position = new Position();
    // public readonly children: C[];
    private latest: NewPos = new NewPos(-1, -1);
    protected childPositions: NewPos[] = [];
    private readonly updateListeners: PositionTreeUpdateListener[] = [];

    constructor(public readonly children: C[] = []) {
        super();

        // this.position.addUpdateListener(() => {
        //     this.updateChildPositions();
        // });

        // this.children = new Proxy(children, {
        //     defineProperty(target, prop, descriptor) {
        //         // console.log(`Proxy set ${prop.toString()} = ${descriptor.value}`);
        //         if (typeof prop === "string" && prop === "" + parseInt(prop)) {
        //             self.register(descriptor.value);
        //         }
        //         return Reflect.defineProperty(target, prop, descriptor);
        //     }
        // });

        // for (let child of children) {
        //     this.register(child);
        // }

        // const self = this;
    }
    
    // protected register(child: C) {
        // child.position.addUpdateListener(() => {
        //     
        //     // console.log("updating children after " + this.children.indexOf(child) + "@ depth " + this.depth);
        //     const index = this.children.indexOf(child);
        //     if (index + 1 < this.children.length) {
        //         this.updateChildPositions(index + 1, index + 2);
        //     }
        // });

        // child.position.setPosition(() => {
        //     return this.calculateChildPosition(this.children.indexOf(child), child);
        // });
    // }

    protected updateChildPositions(start: number = 0, end: number = this.children.length): void {
        this.childPositions = this.childPositions.slice(start, this.children.length);
        // this.depth++;
        // if (this.depth > 500) {
        //     throw new RangeError("Update listener depth > 500");
        // }
        // if (start < 0 || end > this.children.length) {
        //     throw new RangeError(`Range ${start} to ${end} is out of bounds for array of length ${this.children.length}`);
        // }
        // console.log(`Updating children ${start}-${end} @ depth ${this.depth}`);
        // for (let i = start; i < end; i++) {
        //     // console.log("updating child " + this.children.indexOf(child) + " @ depth " + this.depth);
        //     // if (this.children.indexOf(child) < start) {
        //     //     // console.log(this.children);
        //     //     console.timeEnd();
        //     //     throw new Error(`Child ${child} found at positions ${this.children.indexOf(child)} and `
        //     //         + `${this.children.indexOf(child, start)} of ${this}, duplicate children`
        //     //         + `are forbidden`);
        //     // }
        //     this.children[i].position.update();
        // }

        for (let listener of this.updateListeners) {
            listener(start, end);
        }

        // // console.log(`Done pdating children ${start}-${end} @ depth ${this.depth}`);
        // this.depth--;
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

        for (let i = 0; i < this.children.length; i++) {
            if (this.childPositions[i] === undefined) {
                this.childPositions[i] = this.calculateChildPosition({ownPosition: pos, index: i, child: this.children[i], skin});
            }

            this.children[i].draw(skin, this.childPositions[i]);
        }
    }

    /// This is calculated for each element in the tree lazily, depth-first. It can only be reliable called
    /// during a call to the draw() method. Because it is depth-first, earlier children, earlier siblings, and
    /// children of those siblings will be accurate if you call this method during the drawing process.
    protected abstract calculateChildPosition(data: PositioningData<C>): NewPos;
}