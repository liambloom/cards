import { Element, Skin, NewPos, Parent, HitBox } from "./display.js";

export class Card extends Element {
    public readonly face: CardFace;

    public constructor(
        value: CardValue, suit: Suit, 
        public faceUp: boolean = false,
    ) {
        super();

        this.face = new CardFace(value, suit);
    }

    public override draw(skin: Skin, pos: NewPos): HitBox {
       return skin.drawCard(this, pos); 
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
    Black = "black",
    Red = "red"
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
        public readonly color: Color
    ) {
    }
}

export class CardPile extends Parent<Card> {
    public constructor (
        cards: Card[] = [], 
        public cardSpacing: number = 0, 
        public cardAngle: number = 0,
    ) {
        super(cards);
    }

    public shuffle() {
        // https://stackoverflow.com/a/12646864/11326662
        for (let i = this.children.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // console.log(`Shuffling: i=${i}, j=${j}`);
            [this.children[i], this.children[j]] = [this.children[j], this.children[i]];
        }
    }

    // This is public so cardpilecombiner can put the bottom card of a pile on top
    //  of this one in the place that the next card would be.
    public override calculateChildPosition(index: number): NewPos {
        return new NewPos(this.latestPosition.x + this.cardSpacing * index * Math.cos(this.cardAngle), this.latestPosition.y + this.cardSpacing * index * Math.sin(this.cardAngle));
    }
}

export class CardPileCombiner extends Parent<CardPile> {
    public constructor(piles: CardPile[] = [],) {
        super(piles);
    }

    // protected override register(pile: CardPile): void {
    //     super.register(pile);
    //     pile.addUpdateListener(() => {
    //         const index = this.children.indexOf(pile);
    //         this.updateChildPositions(index);
    //     });
    // }

    public override calculateChildPosition(index: number, skin: Skin): NewPos {
        if (index === 0) {
            return this.latestPosition;
        }
        else {
            const under = this.children[index - 1];
            return under.calculateChildPosition(under.children.length);
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
        return new CardPile(r.slice(0, +(new URLSearchParams(new URL(location.href).searchParams).get("deckSize") ?? 52)));
    }
}