"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = void 0;
class Position {
    constructor(a, b) {
        this.xCalc = () => 0;
        this.yCalc = () => 0;
        this.updateListeners = [];
        if (a === undefined) {
            this.setPosition(0, 0);
        }
        else {
            // @ts-ignore
            this.setPosition(a, b);
        }
    }
    get x() {
        if (this.xVal === undefined) {
            this.xVal = this.xCalc();
        }
        return this.xVal;
    }
    get y() {
        if (this.yVal === undefined) {
            this.yVal = this.yCalc();
        }
        return this.yVal;
    }
    set x(value) {
        this.xVal = this.xCalc();
        if (typeof value === "number") {
            this.xCalc = () => value;
        }
        else {
            this.xCalc = value;
        }
        this.update();
    }
    set y(value) {
        this.yVal = this.yCalc();
        if (typeof value === "number") {
            this.yCalc = () => value;
        }
        else {
            this.yCalc = value;
        }
        this.update();
    }
    get coordinates() {
        return [this.x, this.y];
    }
    set coordinates([x, y]) {
        this.setPosition(x, y);
    }
    setPosition(a, b) {
        if (b === undefined) {
            this.x = () => {
                const [x, y] = a();
                this.yVal = y;
                return x;
            };
            this.y = () => {
                const [x, y] = a();
                this.xVal = x;
                return y;
            };
        }
        else {
            this.x = a;
            this.y = b;
        }
    }
    update() {
        const [oldX, oldY] = [this.x, this.y];
        this.xVal = this.yVal = undefined;
        if (this.updateListeners.length > 0) {
            const [newX, newY] = [this.x, this.y];
            for (let listener of this.updateListeners) {
                listener([oldX, oldY], [newX, newY]);
            }
        }
    }
    addUpdateListener(listener) {
        this.updateListeners.push(listener);
    }
    removeUpdateListener(listener) {
        const index = this.updateListeners.indexOf(listener);
        if (index !== -1) {
            this.updateListeners.splice(index, 1);
            return true;
        }
        return false;
    }
}
exports.Position = Position;
