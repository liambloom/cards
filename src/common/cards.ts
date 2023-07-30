import { ClosedTokenProperty, Token, TokenGroup, TokenPropertyValue, combinationTokenGroup } from "./token";

export class Card extends Token {
    constructor() {
        super();
    }

    toString(): string {
        const front = this.getPart("front");
        return front.properties.get(FRENCH_SUITS)?.abbr as string + front.properties.get(STD_INDICES_EN)?.abbr as string;
    }
}

export type Deck = TokenGroup<Card>

export const DECKS = {
    std52(): Deck {
        return combinationTokenGroup(() => new Card(), new Map([["front", [FRENCH_SUITS, STD_INDICES_EN]]]));
    }
}

export const FRENCH_SUITS: ClosedTokenProperty = new ClosedTokenProperty("suit", [0, 1, 2, 3].map(n => new TokenPropertyValue(String.fromCharCode(0x2660 + n))));
export const STD_INDICES_EN: ClosedTokenProperty = new ClosedTokenProperty("value", 
    ["Ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King"].map(v => new TokenPropertyValue(v.toString())));