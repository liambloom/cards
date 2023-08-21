import { Skinnable, Skin, Position } from "./display";

export class Card implements Skinnable {
    public readonly face: CardFace;
    public readonly position: Position = new Position();

    public constructor(
        value: CardValue, suit: Suit, 
        public faceUp: boolean = false,
    ) {
        this.face = new CardFace(value, suit);
    }

    public draw(skin: Skin) {
       skin(this); 
    }
}

export class CardFace {
    public constructor(
        public readonly value: CardValue, 
        public readonly suit: Suit
    ) {
    }
}

export class CardValue {
    public static Ace = new CardValue("Ace", "A", 1);
    public static N2 = new CardValue(2);
    public static N3 = new CardValue(3);
    public static N4 = new CardValue(4);
    public static N5 = new CardValue(5);
    public static N6 = new CardValue(6);
    public static N7 = new CardValue(7);
    public static N8 = new CardValue(8);
    public static N9 = new CardValue(9);
    public static N10 = new CardValue(10);
    public static Jack = new CardValue("Jack", "J", 11);
    public static Queen = new CardValue("Queen", "Q", 12);
    public static King = new CardValue("King", "K", 13);

    public static values = [this.Ace, this.N2, this.N3, this.N4, this.N5, this.N6, 
        this.N7, this.N8, this.N9, this.N10, this.Jack, this.Queen, this.King] as const;

    static [Symbol.iterator]() {
        return this.values[Symbol.iterator]()
    }

    public readonly name: string;
    public readonly symbol: string;
    public readonly value: number;

    private constructor(name: number);
    private constructor(name: string, symbol: string, value: number);
    private constructor(name: string | number, symbol?: string, value?: number) {
        if (typeof name === "number") {
            this.name = name + "";
            this.symbol = name + "";
            this.value = name;
        }
        else {
            this.name = name;
            this.symbol = symbol!;
            this.value = value!;
        }
    }
}

export enum Color {
    Black,
    Red
}

export class Suit {
    public static Spades = new Suit("Spades", "\u2660", Color.Black);
    public static Hearts = new Suit("Hearts", "\u2661", Color.Red);
    public static Diamonds = new Suit("Diamonds", "\u2662", Color.Red);
    public static Clubs = new Suit("Clubs", "\u2663", Color.Black);

    public static values = [this.Spades, this.Hearts, this.Diamonds, this.Clubs] as const;

    static [Symbol.iterator]() {
        return this.values[Symbol.iterator]()
    }

    private constructor(
        public readonly name: string, 
        public readonly symbol: string, 
        public readonly value: Color
    ) {
    }
}

// TODO: this needs to be able to know all the cards that are added. But I don't want to fully 
//      implement an array
// Solution: `Proxy`s are an incredibly powerful feature of es6 that allows you to intercept and
//      react to method calls, property additions and deletions, etc:
//          https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
//          https://stackoverflow.com/a/5100420/11326662 (solution 3 in this answer)
//
// Importatn question: With this, do I still want to use the Position class? Probably

export class CardPile implements Skinnable {
    public readonly position: Position = new Position();

    public constructor (
        public readonly cards: Card[] = [], 
        public cardSpacing: number = 0, 
        public cardAngle: number = 0,
    ) {
        for (let i of cards.keys()) {
            [cards[i].x, cards[i].y] = this.cardPosition(i);
        }
    }

    public shuffle() {
        // https://stackoverflow.com/a/12646864/11326662
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    public draw(skin: Skin) {
        for (let card of this.cards) {
            card.draw(skin);
        }
    }

    // This is public so cardpilecombiner can put the bottom card of a pile on top
    //  of this one in the place that the next card would be.
    public cardPosition(index: number): [number, number] {

    }
}

export class CardPileCombiner {
    public readonly position: Position = new Position();

    public constructor(
        public readonly piles: CardPile[] = [],
    ) {
    }

    public draw(skin: Skin) {
        for (let pile of this.piles) {
            pile.draw(skin);
        }
    }
}

export namespace decks {
    export function std52() {
        let r = [];
        for (let suit of Suit) {
            for (let value of CardValue) {
                r.push(new Card(value, suit));
            }
        }
        return new CardPile(r);
    }
}