export const DEBUG_SKIN = {
    cardWidth: 1,
    cardHeight: 1,
    drawCard(card) {
        console.log(`${card.faceUp ? (card.face.value.symbol + card.face.suit.symbol) : "??"} @ Position (${card.position.x}, ${card.position.y})`);
    }
};
export class Skinnable {
    constructor() {
        this.skinVal = DEBUG_SKIN;
    }
    get skin() {
        return this.skinVal;
    }
    set skin(val) {
        this.setSkinNoRefresh(val);
        this.draw();
    }
    setSkinNoRefresh(val) {
        this.skinVal = val;
    }
}
export class Position {
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
export class PositionTree extends Skinnable {
    constructor(children = []) {
        super();
        this.position = new Position();
        this.updateListeners = [];
        this.depth = 0;
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
    setSkinNoRefresh(val) {
        super.setSkinNoRefresh(val);
        for (let child of this.children) {
            child.setSkinNoRefresh(val);
        }
    }
    register(child) {
        child.position.addUpdateListener(() => {
            console.log("updating children after " + this.children.indexOf(child));
            this.updateChildPositions(this.children.indexOf(child) + 1);
        });
        child.position.setPosition(() => {
            return this.calculateChildPosition(this.children.indexOf(child), child);
        });
    }
    updateChildPositions(start = 0, end = this.children.length) {
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
    addUpdateListener(callback) {
        this.updateListeners.push(callback);
    }
    removeUpdateListener(callback) {
        const index = this.updateListeners.indexOf(callback);
        if (index === -1) {
            return false;
        }
        this.updateListeners.splice(index, 1);
        return true;
    }
    draw() {
        for (let child of this.children) {
            child.draw();
        }
    }
}
