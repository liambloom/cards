import { Token, TokenGroup } from "./token";

export class Table {

}

export interface TokenArea {
    visibleTo: 

}

export class TableArea implements TokenArea {

}

export class Hand implements TokenArea {

}

export interface Renderer<T extends Token, U extends TokenGroup<T>> {
    renderTable(table: Table): void;
    renderHand(hand: Hand): void;
    renderToken(area: TokenArea, token: T): void;
    renderTokenGroup(area: TokenArea, group: U): void;
}