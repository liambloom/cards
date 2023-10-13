import { Position, PositionTree, Skinnable } from "./display.js";
export class Table extends PositionTree {
    constructor(content = [], skin) {
        super();
        this.content = content;
        if (skin !== undefined) {
            this.setSkinNoRefresh(skin);
        }
    }
    calculateChildPosition(index, child) {
        return child.position.coordinates;
    }
}
export class TableLayoutElement extends PositionTree {
}
export class TableRow extends TableLayoutElement {
    constructor() {
        super(...arguments);
        this.position = new Position();
        this.gapVal = 0;
    }
    get gap() {
        return this.gapVal;
    }
    set gap(val) {
        this.gapVal = val;
        this.updateChildPositions();
    }
    calculateChildPosition(index) {
        return [this.position.x, this.position.y + index * (this.gapVal + this.skin.cardWidth)];
    }
}
// Position is private, and everything else that gets displayed gets displayed
//  by being on the table, and its position is controlled, eventually, by the TableSlot.
//  I can implement a more intricate and pretty way of organizing TableSlots,
//  and this is used to calculate its position, which will trickle down to everything
//  else that is drawn, so positions will never be directly interacted with.
//
// Q: Is there a way to make positions package-private?
//   
export class TableSlot extends Skinnable {
    constructor(content = null) {
        super();
        this.position = new Position();
        this.content = content;
        this.position.addUpdateListener((_, newVal) => {
            if (this.content !== null) {
                this.content.position.coordinates = newVal;
            }
        });
    }
    get content() {
        return this.contentVal;
    }
    set content(value) {
        this.contentVal = value;
        if (value !== null) {
            value.position.coordinates = this.position.coordinates;
        }
    }
    draw() {
        if (this.content !== null) {
            this.content.draw();
        }
    }
}
