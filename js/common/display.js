export class NewPos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}
// TODO: Just have element do this. When a click happens, call something on the table, that
// passes it down like this, WITHOUT
export class HitBoxEvent {
    constructor(target, currentTarget, targetStack) {
        this.target = target;
        this.currentTarget = currentTarget;
        this.targetStack = targetStack;
    }
}
export class Rectangle {
    constructor(pos, width, height) {
        this.pos = pos;
        this.width = width;
        this.height = height;
    }
    checkHit(pos) {
        return pos.x >= this.pos.x
            && pos.y >= this.pos.y
            && pos.x <= this.pos.x + this.width
            && pos.y <= this.pos.y + this.height;
    }
}
export class Element {
    constructor() {
        this.latest = new NewPos(-1, -1);
    }
    get latestPosition() {
        return this.latest;
    }
}
export class Parent extends Element {
    constructor(children = []) {
        super();
        this.children = children;
        this.childPositions = [];
        this.updateListeners = [];
    }
    updateChildPositions(start = 0, end = this.children.length) {
        // let insert: NewPos[] = [];
        // insert.length = end - start;
        // this.childPositions = this.childPositions.splice(start, end - start, ...insert);
        this.childPositions = this.childPositions.slice(0, start);
        for (let listener of this.updateListeners) {
            listener(start, end);
        }
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
    draw(skin, pos) {
        var _a, _b;
        var _c;
        if (!pos.equals(this.latestPosition)) {
            this.childPositions.length = 0;
        }
        this.latest = pos;
        for (let i = 0; i < this.children.length; i++) {
            (_a = (_c = this.childPositions)[i]) !== null && _a !== void 0 ? _a : (_c[i] = this.calculateChildPosition(i, skin));
            (_b = this.children[i]) === null || _b === void 0 ? void 0 : _b.draw(skin, this.childPositions[i]);
        }
    }
    maybeClick(pos, callback, targetStack) {
        for (let i = this.children.length - 1; i >= 0; i--) {
            const hit = this.children[i].maybeClick(pos, callback, [this, ...targetStack]);
            if (hit !== null) {
                callback(new HitBoxEvent(hit[0], this, hit));
                return hit;
            }
        }
        return null;
    }
    getChildPosition(index, skin) {
        var _a;
        return (_a = this.childPositions[index]) !== null && _a !== void 0 ? _a : this.calculateChildPosition(index, skin);
    }
}
export class HoldingParent extends Parent {
    constructor(child) {
        super(new Proxy([], {
            defineProperty(target, prop, descriptor) {
                if (typeof prop === "string" && prop === "" + parseInt(prop) && (prop !== "0" || !(descriptor.value === child || typeof descriptor.get == "function" && descriptor.get() === child))) {
                    throw new Error("HoldingParent is mean to hold one specific child in index 0, cannot add other children or children in other places");
                }
                return Reflect.defineProperty(target, prop, descriptor);
            }
        }));
        this.child = child;
    }
    calculateChildPosition(index, skin) {
        return this.child.latestPosition;
    }
}
