import { Card } from "../common/cards.js";

export interface Skin {
    get cardWidth(): number;
    get cardHeight(): number;

    drawCard(card: Card): void;
}

export const DEBUG_SKIN: Skin = {
    cardWidth: 1,
    cardHeight: 1,

    drawCard(card: Card): void {
        console.log(`${card.faceUp ? (card.face.value.symbol + card.face.suit.symbol) : "??"} @ Position (${card.position.x}, ${card.position.y})`);
    }
} as const;

export abstract class Skinnable {
    private skinVal: Skin = DEBUG_SKIN;
    public abstract get position(): Position;

    public get skin(): Skin {
        return this.skinVal;
    }

    public set skin(val: Skin) {
        this.setSkinNoRefresh(val);
        this.draw();
    }

    public setSkinNoRefresh(val: Skin) {
        this.skinVal = val;
    }

    abstract draw(): void;
}

export type PositionUpdateListener = (oldValue: [number, number], newValue: [number, number]) => void;

export class Position {
    private xVal: number | undefined;
    private yVal: number | undefined;    
    private xCalc: () => number = () => 0;
    private yCalc: () => number = () => 0;
    private updateListeners: PositionUpdateListener[] = [];

    public constructor();
    public constructor(x: number | (() => number), y: number | (() => number));
    public constructor(pos: () => [number, number]);
    public constructor(a?: number | (() => number) | (() => [number, number]), b?: number | (() => number)) {
        if (a === undefined) {
            this.setPosition(0, 0);
        }
        else {
            // @ts-ignore
            this.setPosition(a, b);
        }
    }

    public get x(): number {
        if (this.xVal === undefined) {
            this.xVal = this.xCalc();
        }
        return this.xVal;
    }

    public get y(): number {
        if (this.yVal === undefined) {
            this.yVal = this.yCalc();
        }
        return this.yVal;
    }

    public set x(value: number | (() => number)) {
        this.xVal = this.xCalc();

        if (typeof value === "number") {
            this.xCalc = () => value;
        }
        else {
            this.xCalc = value;
        }

        this.update();
    }

    public set y(value: number | (() => number)) {
        this.yVal = this.yCalc();

        if (typeof value === "number") {
            this.yCalc = () => value;
        }
        else {
            this.yCalc = value;
        }

        this.update();
    }

    public get coordinates() {
        return [this.x, this.y];
    }

    public set coordinates([x, y]: [number, number]) {
        this.setPosition(x, y);
    }

    public setPosition(x: number | (() => number), y: number | (() => number)): void;
    public setPosition(pos: () => [number, number]): void;
    public setPosition(a: number | (() => number) | (() => [number, number]), b?: number | (() => number)): void {
        if (b === undefined) {
            this.x = () => {
                const [x, y] = (a as (() => [number, number]))();
                this.yVal = y;
                return x;
            }
            this.y = () => {
                const [x, y] = (a as (() => [number, number]))();
                this.xVal = x;
                return y;
            }
        }
        else {
            this.x = a as number | (() => number);
            this.y = b;
        }
    }

    public update() {
        const [oldX, oldY] = [this.x, this.y];
        this.xVal = this.yVal = undefined;

        if (this.updateListeners.length > 0) {
            const [newX, newY] = [this.x, this.y];
    
            for (let listener of this.updateListeners) {
                listener([oldX, oldY], [newX, newY]);
            }
        }
    }

    public addUpdateListener(listener: PositionUpdateListener) {
        this.updateListeners.push(listener);
    }

    public removeUpdateListener(listener: PositionUpdateListener) {
        const index = this.updateListeners.indexOf(listener);
        if (index !== -1) {
            this.updateListeners.splice(index, 1);
            return true;
        }
        return false;
    }
}

export type PositionTreeUpdateListener = (start: number, end: number) => void;

export abstract class PositionTree<C extends Skinnable> extends Skinnable {
    public readonly position: Position = new Position();
    public readonly children: C[];
    private readonly updateListeners: PositionTreeUpdateListener[] = [];
    private depth: number = 0;

    constructor(children: C[] = []) {
        super();

        this.position.addUpdateListener(() => {
            this.updateChildPositions();
        });

        this.children = new Proxy(children, {
            defineProperty(target, prop, descriptor) {
                if (typeof prop === "string" && prop === "" + parseInt(prop)) {
                    self.register(descriptor.value);
                }
                return Reflect.defineProperty(target, prop, descriptor);
            }
        });

        for (let child of children) {
            this.register(child);
        }

        const self = this;
    }

    public override setSkinNoRefresh(val: Skin) {
        super.setSkinNoRefresh(val);

        for (let child of this.children) {
            child.setSkinNoRefresh(val);
        }
    }
    
    protected register(child: C) {
        child.position.addUpdateListener(() => {
            console.log("updating children after " + this.children.indexOf(child));
            this.updateChildPositions(this.children.indexOf(child) + 1)
        });

        child.position.setPosition(() => {
            return this.calculateChildPosition(this.children.indexOf(child), child);
        });
    }

    protected updateChildPositions(start: number = 0, end: number = this.children.length): void {
        this.depth++;
        for (let child of this.children.slice(start, end)) {
            console.log("updating child " + this.children.indexOf(child) + " @ depth " + this.depth);
            child.position.update();
        }

        for (let listener of this.updateListeners) {
            listener(start, end);
        }
        this.depth--;
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

    public override draw() {
        for (let child of this.children) {
            child.draw();
        }
    }

    protected abstract calculateChildPosition(index?: number, child?: C): [number, number];
}