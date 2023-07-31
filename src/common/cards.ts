import { ClosedTokenProperty, Token, TokenGroup, TokenPart, TokenPropertyValue, combinationTokenParts } from "./token";

export class Card extends Token {
    // TODO: facing is more complicated than boolean: faceup on table, facedown on table, visible to one or more players
    private facingFrontField: boolean = undefined as unknown as boolean;

    constructor(facingFront: boolean, front?: TokenPart, back?: TokenPart) {
        super(new Map([
            ["front", front],
            ["back", back]
        ].filter(([_, val]) => val !== undefined).map(e => e as [string, TokenPart])));
        this.facingFront = facingFront;
    }

    get front(): TokenPart {
        return this.getPart("front");
    }

    get back(): TokenPart {
        return this.getPart("back");
    }

    get facingFront(): boolean {
        return this.facingFrontField;
    }

    get facingBack(): boolean {
        return !this.facingFront;
    }

    set facingFront(value: boolean) {
        this.front.

        this.facingFrontField = value;
    }

    // toString(): string {
    //     const front = this.getPart("front");
    //     return front.properties.get(FRENCH_SUITS)?.abbr as string + front.properties.get(STD_INDICES_EN)?.abbr as string;
    // }
}

export class CardGroup extends TokenGroup<Card> {

}

export const DECKS = {
    std52(): CardGroup {
        return new CardGroup(combinationTokenParts(new Map([["front", [FRENCH_SUITS, STD_INDICES_EN]]])).map(parts => new Card(parts.get("front"))));
    }
}

export const FRENCH_SUITS: ClosedTokenProperty = new ClosedTokenProperty("suit", ["Spade", "Heart", "Diamond", "Club"]
    .map((name, index) => new TokenPropertyValue(name, String.fromCharCode(0x2660 + index))));
export const STD_INDICES_EN: ClosedTokenProperty = new ClosedTokenProperty("value", 
    ["Ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "Jack", "Queen", "King"].map(v => new TokenPropertyValue(v.toString())));