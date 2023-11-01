export const DEBUG_SKIN = {
    cardWidth: 1,
    cardHeight: 1,
    minValueVisibleHeight: 1,
    minValueVisibleWidth: 1,
    drawCard(card, position) {
        console.log(`${card.faceUp ? (card.face.value.symbol + card.face.suit.symbol) : "??"} @ Position (${position.x}, ${position.y})`);
    }
};
export class Skinnable {
}
export class NewPos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}
export class PositionTree extends Skinnable {
    constructor(children = []) {
        super();
        this.children = children;
        // public readonly position: Position = new Position();
        // public readonly children: C[];
        this.latest = new NewPos(-1, -1);
        this.childPositions = [];
        this.updateListeners = [];
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
    updateChildPositions(start = 0, end = this.children.length) {
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
        if (!pos.equals(this.latest)) {
            this.childPositions = [];
        }
        this.latest = pos;
        for (let i = 0; i < this.children.length; i++) {
            if (this.childPositions[i] === undefined) {
                this.childPositions[i] = this.calculateChildPosition({ ownPosition: pos, index: i, child: this.children[i], skin });
            }
            this.children[i].draw(skin, this.childPositions[i]);
        }
    }
}
