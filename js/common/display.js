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
        this.latest = new NewPos(-1, -1);
        this.childPositions = [];
        this.updateListeners = [];
    }
    updateChildPositions(start = 0, end = this.children.length) {
        this.childPositions = this.childPositions.slice(start, this.children.length);
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
