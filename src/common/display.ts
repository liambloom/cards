import { Card } from "../common/cards";

export type Skin = (card: Card) => void;

export interface Skinnable {
    draw(skin: Skin): void;
}

type UpdateListener = (oldValue: [number, number], newValue: [number, number]) => void;

export class Position {
    private xVal: number | undefined;
    private yVal: number | undefined;    
    private xCalc!: () => number;
    private yCalc!: () => number;
    private updateListeners: UpdateListener[] = [];

    public constructor(x: number | (() => number) = 0, y: number | (() => number) = 0) {
        this.x = x;
        this.y = y;
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
        if (typeof value === "number") {
            this.xCalc = () => value;
            this.xVal = value;
        }
        else {
            this.xCalc = value;
            this.xVal = undefined;
        }
    }

    public set y(value: number | (() => number)) {
        if (typeof value === "number") {
            this.yCalc = () => value;
            this.yVal = value;
        }
        else {
            this.yCalc = value;
            this.yVal = undefined
        }
    }

    public setPosition(x: number, y: number): void;
    public setPosition(x: () => number, y: () => number): void;
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
        const [newX, newY] = [this.x, this.y];

        for (let listener of this.updateListeners) {
            listener([oldX, oldY], [newX, newY]);
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