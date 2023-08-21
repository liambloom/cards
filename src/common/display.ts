import { Card } from "../common/cards";

export type Skin = (card: Card) => void;

export interface Skinnable {
    draw(skin: Skin): void;
}

export class Position {
    private xCalc!: () => number;
    private yCalc!: () => number;

    public constructor(x: number | (() => number) = 0, y: number | (() => number) = 0) {
        this.x = x;
        this.y = y;
    }

    public get x() {
        return this.xCalc();
    }

    public get y() {
        return this.yCalc();
    }

    public set x(value: number | (() => number)) {
        if (typeof value === "number") {
            this.xCalc = () => value;
        }
        else {
            this.xCalc = value;
        }
    }

    public set y(value: number | (() => number)) {
        if (typeof value === "number") {
            this.yCalc = () => value;
        }
        else {
            this.yCalc = value;
        }
    }
}