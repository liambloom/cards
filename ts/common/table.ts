import { Card, CardPile, CardPileCombiner } from "./cards.js";
import { Position, PositionTree, Skin, Skinnable } from "./display.js";

export class Table extends PositionTree<TableLayoutElement> {

    public constructor(
        public readonly content: TableLayoutElement[] = [],
        skin?: Skin
    ) {
        super();

        if (skin !== undefined) {
            this.setSkinNoRefresh(skin);
        }
    }

    public override calculateChildPosition(index: number, child: TableLayoutElement): [number, number] {
        return child.position.coordinates;
    }
}

export abstract class TableLayoutElement extends PositionTree<TableSlot> {

}

export class TableRow extends TableLayoutElement {
    public readonly position = new Position();
    private gapVal: number = 0;

    public get gap(): number {
        return this.gapVal;
    }

    public set gap(val: number) {
        this.gapVal = val;
        this.updateChildPositions();
    }

    protected override calculateChildPosition(index: number): [number, number] {
        return [this.position.x, this.position.y + index * (this.gapVal + this.skin.cardWidth)];
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
    public readonly position: Position = new Position();
    private contentVal!: TableSlotContent;

    public constructor(
        content: TableSlotContent = null,
    ) {
        super();

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

    public override draw() {
        if (this.content !== null) {
            this.content.draw();
        }
    }
}