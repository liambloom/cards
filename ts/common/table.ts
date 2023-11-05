import { Card, CardPile, CardPileCombiner } from "./cards.js";
import { DEBUG_SKIN, NewPos, PositionTree, PositioningData, Skin, Skinnable } from "./display.js";

export class Table extends PositionTree<TableLayoutElement> {

    public constructor(
        children: TableLayoutElement[] = [],
        public skin: Skin = DEBUG_SKIN
    ) {
        super(children);
    }

    public override calculateChildPosition({child}: PositioningData<TableLayoutElement>): NewPos {
        return child.position;
    }

    public draw(): void {
        // console.log(this.skin);
        super.draw(this.skin, new NewPos(-1, -1));
    }
}

export abstract class TableLayoutElement extends PositionTree<TableSlot> {
    public abstract position: NewPos;

}

export class TableRow extends TableLayoutElement {
    public position = new NewPos(0, 0);
    private gapVal: number = 0;

    public get gap(): number {
        return this.gapVal;
    }

    public set gap(val: number) {
        this.gapVal = val;
        this.updateChildPositions();
    }

    protected override calculateChildPosition({index, skin}: PositioningData<TableSlot>): NewPos {
        return new NewPos(this.position.x + index * (this.gapVal + skin.cardWidth), this.position.y);
    }
}

export type TableSlotContent = Card | CardPile | CardPileCombiner | null;

// Position is private, and everything else that gets displayed gets displayed
//  by being on the table, and its position is controlled, eventually, by the TableSlot.
//  I can implement a more intricate and pretty way of organizing TableSlots,
//  and this is used to calculate its position, which will trickle down to everything
//  else that is drawn, so positions will never be directly interacted with.
//
// Q: Is there a way to make positions package-private?
//   
export class TableSlot extends Skinnable {
    private contentVal!: TableSlotContent | null;

    public constructor(
        content: TableSlotContent | null = null,
    ) {
        super();

        this.content = content;
    }

    public get content() {
        return this.contentVal;
    }

    public set content(value: TableSlotContent) {
        this.contentVal = value;
    }

    public override draw(skin: Skin, pos: NewPos) {
        if (this.content !== null) {
            this.content.draw(skin, pos);
        }
    }
}