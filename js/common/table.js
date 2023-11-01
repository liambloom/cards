import { DEBUG_SKIN, NewPos, PositionTree, Skinnable } from "./display.js";
export class Table extends PositionTree {
    constructor(children = [], skin = DEBUG_SKIN) {
        super(children);
        this.autoRedraw = true;
        this.skinVal = skin;
    }
    get skin() {
        return this.skinVal;
    }
    set skin(skin) {
        this.skinVal = skin;
        if (this.autoRedraw) {
            this.draw();
        }
    }
    calculateChildPosition({ child }) {
        return child.position;
    }
    draw() {
        console.log(this.skin);
        super.draw(this.skin, new NewPos(-1, -1));
    }
}
export class TableLayoutElement extends PositionTree {
}
export class TableRow extends TableLayoutElement {
    constructor() {
        super(...arguments);
        this.position = new NewPos(0, 0);
        this.gapVal = 0;
    }
    get gap() {
        return this.gapVal;
    }
    set gap(val) {
        this.gapVal = val;
        this.updateChildPositions();
    }
    calculateChildPosition({ index, skin }) {
        return new NewPos(this.position.x + index * (this.gapVal + skin.cardWidth), this.position.y);
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
        this.content = content;
    }
    get content() {
        return this.contentVal;
    }
    set content(value) {
        this.contentVal = value;
    }
    draw(skin, pos) {
        if (this.content !== null) {
            this.content.draw(skin, pos);
        }
    }
}
