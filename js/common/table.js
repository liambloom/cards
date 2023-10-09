"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableSlot = exports.Table = void 0;
const display_1 = require("./display");
class Table {
    constructor(content) {
        this.content = content;
    }
}
exports.Table = Table;
// Position is private, and everything else that gets displayed gets displayed
//  by being on the table, and its position is controlled, eventually, by the TableSlot.
//  I can implement a more intricate and pretty way of organizing TableSlots,
//  and this is used to calculate its position, which will trickle down to everything
//  else that is drawn, so positions will never be directly interacted with.
//
// Q: Is there a way to make positions package-private?
//   
class TableSlot {
    constructor(content = null) {
        this.position = new display_1.Position();
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
    draw(skin) {
        if (this.content !== null) {
            this.content.draw(skin);
        }
    }
}
exports.TableSlot = TableSlot;
