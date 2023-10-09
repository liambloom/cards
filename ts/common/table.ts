import { Card, CardPile, CardPileCombiner } from "./cards";
import { Position, Positioned, Skin, Skinnable } from "./display";

export class Table {

    public constructor(
        public readonly content: TableSlot[]
    ) {
    }
}

interface TableLayoutElement extends Skinnable, Positioned {

}

class TableRow implements TableLayoutElement {
    public readonly position = new Position();
    public content = 

    public draw(skin: Skin): void {
        
    }
}

type TableSlotContent = Card | CardPile | CardPileCombiner | null;

// Position is private, and everything else that gets displayed gets displayed
//  by being on the table, and its position is controlled, eventually, by the TableSlot.
//  I can implement a more intricate and pretty way of organizing TableSlots,
//  and this is used to calculate its position, which will trickle down to everything
//  else that is drawn, so positions will never be directly interacted with.
//
// Q: Is there a way to make positions package-private?
//   
export class TableSlot implements Skinnable {
    private contentVal!: TableSlotContent;
    private position: Position = new Position();

    public constructor(
        content: TableSlotContent = null,
    ) {
        this.content = content;
        
        this.position.addUpdateListener((_, newVal) => {
            if (this.content !== null) {
                this.content.position.coordinates = newVal;
            }
        });
    }

    public get content() {
        return this.contentVal;
    }

    public set content(value: TableSlotContent) {
        this.contentVal = value;
        if (value !== null) {
            value.position.coordinates = this.position.coordinates;
        }
    }

    public draw(skin: Skin) {
        if (this.content !== null) {
            this.content.draw(skin);
        }
    }
}