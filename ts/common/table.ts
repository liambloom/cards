import { Card, CardPile, CardPileCombiner } from "./cards.js";
import { NewPos, Parent, Skin, Element, HitBox, Rectangle, HitBoxEvent } from "./display.js";

export class Table extends Parent<TableLayoutElement> {

    public constructor(
        children: TableLayoutElement[] = [],
        public skin: Skin,
    ) {
        super(children);
    }

    public override calculateChildPosition(index: number): NewPos {
        return this.children[index].position;
    }

    public override maybeClick(pos: NewPos, callback: (e: HitBoxEvent) => void): Element[] {
        let cardTarget = super.maybeClick(pos, callback, [this]);
        if (cardTarget === null) {
            callback(new HitBoxEvent(this, this, [this]));
            return [this];
        }
        else {
            return cardTarget;
        }
    }

    public pathTo(e: Element): Element[] {
        const r = this.pathToFrom(this, e);
        if (r === null) {
            throw new Error("Table does not contain element " + e);
        }
        return r;
    }

    private pathToFrom(from: Parent<Element>, target: Element): Element[] | null {
        for (let e of from.children) {
            if (e === target) {
                return [e];
            }
            if (e instanceof Parent) {
                const recurse = this.pathToFrom(e, target);
                if (recurse !== null) {
                    return [...recurse, e];
                }
            }
        }
        return null;
    }

    public draw(): void {
        super.draw(this.skin, new NewPos(-1, -1));
    }
}

export abstract class TableLayoutElement extends Parent<TableSlotContent> {
    public abstract position: NewPos;

    public override draw(skin: Skin, pos: NewPos): void {
        if (!pos.equals(this.latestPosition)) {
            this.childPositions.length = 0;
        }

        for (let i = 0; i < this.children.length; i++) {
            this.childPositions[i] ??= this.calculateChildPosition(i, skin);
            this.children[i]?.draw(skin, this.childPositions[i]);
        }
    }
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

    public override calculateChildPosition(index: number, skin: Skin): NewPos {
        return new NewPos(this.position.x + index * (this.gapVal + skin.cardWidth), this.position.y);
    }
}

export type TableSlotContent = Card | CardPile | CardPileCombiner;// | null;

// Position is private, and everything else that gets displayed gets displayed
//  by being on the table, and its position is controlled, eventually, by the TableSlot.
//  I can implement a more intricate and pretty way of organizing TableSlots,
//  and this is used to calculate its position, which will trickle down to everything
//  else that is drawn, so positions will never be directly interacted with.
//
// Q: Is there a way to make positions package-private?
//   
// export class TableSlot extends Element {
//     private contentVal!: TableSlotContent;

//     public constructor(
//         content: TableSlotContent = null,
//     ) {
//         super();

//         this.content = content;
//     }

//     public get content() {
//         return this.contentVal;
//     }

//     public set content(value: TableSlotContent) {
//         this.contentVal = value;
//     }
    
//     public override maybeClick(pos: NewPos, callback: (e: HitBoxEvent) => void, targetStack: Element[]): Element[] | null {
//         return this.contentVal?.maybeClick(pos, callback, targetStack) ?? null;
//     }

//     public override draw(skin: Skin, pos: NewPos): void {
//         if (this.content !== null) {
//             this.content.draw(skin, pos);
//         }
//     }
// }