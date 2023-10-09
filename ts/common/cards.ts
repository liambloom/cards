import { Skinnable, Skin, Position, Positioned } from "./display";

export class Card implements Skinnable, Positioned {
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

export class CardPile implements Skinnable, Positioned {
    public readonly position: Position = new Position();
    public readonly cards: Card[];

    public constructor (
        cards: Card[] = [], 
        public cardSpacing: number = 0, 
        public cardAngle: number = 0,
    ) {
        this.position.addUpdateListener(() => {
            this.updateCards(0, this.cards.length);
        });

        for (let card of cards) {
            this.register(card);
        }

        const cardPile = this;

        this.cards = new Proxy(cards, {
            defineProperty(target, prop, descriptor) {
                if (typeof prop === "string" && prop === "" + parseInt(prop)) {
                    cardPile.register(descriptor.value);
                }
                return Reflect.defineProperty(target, prop, descriptor);
            }
        });
    }

    private register(card: Card) {
        card.position.setPosition(() => this.cardPosition(this.cards.indexOf(card)));
    }

    private updateCards(start: number, end: number) {
        for (let i = start; i < end; i++) {
            this.cards[i].position.update();
        }
    }

    public shuffle() {
        // https://stackoverflow.com/a/12646864/11326662
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }

        this.updateCards(0, this.cards.length);
    }

    public draw(skin: Skin) {
        for (let card of this.cards) {
            card.draw(skin);
        }
    }

    // This is public so cardpilecombiner can put the bottom card of a pile on top
    //  of this one in the place that the next card would be.
    public cardPosition(index: number): [number, number] {
        return [this.cardSpacing * index * Math.cos(this.cardAngle), this.cardSpacing * index * Math.sin(this.cardAngle)];
    }
}

export class CardPileCombiner implements Positioned {
    public readonly position: Position = new Position();
    public readonly piles: CardPile[];

    public constructor(
        piles: CardPile[] = [],
    ) {
        this.position.addUpdateListener(() => {
            this.updatePiles(0, this.piles.length);
        })

        for (let pile of piles) {
            this.register(pile);
        }

        const combiner = this;

        this.piles = new Proxy(piles, {
            defineProperty(target, prop, descriptor) {
                if (typeof prop === "string" && prop === "" + parseInt(prop)) {
                    combiner.register(descriptor.value);
                }
                return Reflect.defineProperty(target, prop, descriptor);
            }
        });
    }

    private register(pile: CardPile) {
        pile.position.addUpdateListener(() => {
            this.updatePiles(this.piles.indexOf(pile) + 1, this.piles.length)
        });

        pile.position.setPosition(() => {
            const index = this.piles.indexOf(pile);

            if (index === 0) {
                return this.position.coordinates;
            }
            else {
                const under = this.piles[index - 1];
                return under.cardPosition(under.cards.length);
            }
        });
    }

    private updatePiles(start: number, end: number) {
        for (let i = start; i < end; i++) {
            this.piles[i].position.update();
        }
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