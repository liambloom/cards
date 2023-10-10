import { Card } from "../common/cards";

export type Skin = (card: Card) => void;

export interface Skinnable {
    draw(skin: Skin): void;
}

export type UpdateListener = (oldValue: [number, number], newValue: [number, number]) => void;

export interface Positioned {
    get position(): Position;
}

export class Position {
    private xVal: number | undefined;
    private yVal: number | undefined;    
    private xCalc: () => number = () => 0;
    private yCalc: () => number = () => 0;
    private updateListeners: UpdateListener[] = [];

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

    public addUpdateListener(listener: UpdateListener) {
        this.updateListeners.push(listener);
    }

    public removeUpdateListener(listener: UpdateListener) {
        const index = this.updateListeners.indexOf(listener);
        if (index !== -1) {
            this.updateListeners.splice(index, 1);
            return true;
        }
        return false;
    }
}

export abstract class PositionTree<C extends Positioned & Skinnable> implements Positioned, Skinnable {
    public readonly position: Position = new Position();
    public readonly children: C[];

    constructor(position: Position, children: C[] = []) {
        this.position.addUpdateListener(() => {
            this.updateChildPositions(0, this.children.length);
        })

        for (let child of children) {
            this.register(child);
        }

        const self = this;

        this.children = new Proxy(children, {
            defineProperty(target, prop, descriptor) {
                if (typeof prop === "string" && prop === "" + parseInt(prop)) {
                    self.register(descriptor.value);
                }
                return Reflect.defineProperty(target, prop, descriptor);
            }
        });
    }
    
    private register(child: C) {
        child.position.addUpdateListener(() => {
            this.updateChildPositions(this.children.indexOf(child) + 1, this.children.length)
        });

        child.position.setPosition(() => {
            return this.calculateChildPosition(this.children.indexOf(child), child);
        });
    }

    protected updateChildPositions(start: number, end: number): void {
        for (let child of this.children.slice(start, end)){
            child.position.update();
        }
    }

    public draw(skin: Skin) {
        for (let child of this.children) {
            child.draw(skin);
        }
    }

    protected abstract calculateChildPosition(index?: number, child?: C): [number, number];
}