import { NewPos, Parent, Element, HitBoxEvent } from "./display.js";
export class Table extends Parent {
    constructor(children = [], skin) {
        super(children);
        this.skin = skin;
    }
    calculateChildPosition(index) {
        return this.children[index].position;
    }
    maybeClick(pos, callback) {
        let cardTarget = super.maybeClick(pos, callback, [this]);
        if (cardTarget === null) {
            callback(new HitBoxEvent(this, this, [this]));
            return [this];
        }
        else {
            return cardTarget;
        }
    }
    draw() {
        // console.log(this.skin);
        super.draw(this.skin, new NewPos(-1, -1));
    }
}
export class TableLayoutElement extends Parent {
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
    calculateChildPosition(index, skin) {
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
export class TableSlot extends Element {
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
    maybeClick(pos, callback, targetStack) {
        var _a, _b;
        return (_b = (_a = this.contentVal) === null || _a === void 0 ? void 0 : _a.maybeClick(pos, callback, targetStack)) !== null && _b !== void 0 ? _b : null;
    }
    draw(skin, pos) {
        // console.log("drawing slot containing " + this.contentVal);
        if (this.content !== null) {
            this.content.draw(skin, pos);
        }
    }
}
