"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.decks = exports.CardPileCombiner = exports.CardPile = exports.Suit = exports.Color = exports.CardValue = exports.CardFace = exports.Card = void 0;
const display_1 = require("./display");
class Card {
    constructor(value, suit, faceUp = false) {
        this.faceUp = faceUp;
        this.position = new display_1.Position();
        this.face = new CardFace(value, suit);
    }
    draw(skin) {
        skin(this);
    }
}
exports.Card = Card;
class CardFace {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
    }
}
exports.CardFace = CardFace;
class CardValue {
    static [Symbol.iterator]() {
        return this.values[Symbol.iterator]();
    }
    constructor(name, symbol, value) {
        if (typeof name === "number") {
            this.name = name + "";
            this.symbol = name + "";
            this.value = name;
        }
        else {
            this.name = name;
            this.symbol = symbol;
            this.value = value;
        }
    }
}
exports.CardValue = CardValue;
_a = CardValue;
CardValue.Ace = new CardValue("Ace", "A", 1);
CardValue.N2 = new CardValue(2);
CardValue.N3 = new CardValue(3);
CardValue.N4 = new CardValue(4);
CardValue.N5 = new CardValue(5);
CardValue.N6 = new CardValue(6);
CardValue.N7 = new CardValue(7);
CardValue.N8 = new CardValue(8);
CardValue.N9 = new CardValue(9);
CardValue.N10 = new CardValue(10);
CardValue.Jack = new CardValue("Jack", "J", 11);
CardValue.Queen = new CardValue("Queen", "Q", 12);
CardValue.King = new CardValue("King", "K", 13);
CardValue.values = [_a.Ace, _a.N2, _a.N3, _a.N4, _a.N5, _a.N6,
    _a.N7, _a.N8, _a.N9, _a.N10, _a.Jack, _a.Queen, _a.King];
var Color;
(function (Color) {
    Color[Color["Black"] = 0] = "Black";
    Color[Color["Red"] = 1] = "Red";
})(Color || (exports.Color = Color = {}));
class Suit {
    static [Symbol.iterator]() {
        return this.values[Symbol.iterator]();
    }
    constructor(name, symbol, value) {
        this.name = name;
        this.symbol = symbol;
        this.value = value;
    }
}
exports.Suit = Suit;
_b = Suit;
Suit.Spades = new Suit("Spades", "\u2660", Color.Black);
Suit.Hearts = new Suit("Hearts", "\u2661", Color.Red);
Suit.Diamonds = new Suit("Diamonds", "\u2662", Color.Red);
Suit.Clubs = new Suit("Clubs", "\u2663", Color.Black);
Suit.values = [_b.Spades, _b.Hearts, _b.Diamonds, _b.Clubs];
class CardPile {
    constructor(cards = [], cardSpacing = 0, cardAngle = 0) {
        this.cardSpacing = cardSpacing;
        this.cardAngle = cardAngle;
        this.position = new display_1.Position();
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
    register(card) {
        card.position.setPosition(() => this.cardPosition(this.cards.indexOf(card)));
    }
    updateCards(start, end) {
        for (let i = start; i < end; i++) {
            this.cards[i].position.update();
        }
    }
    shuffle() {
        // https://stackoverflow.com/a/12646864/11326662
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        this.updateCards(0, this.cards.length);
    }
    draw(skin) {
        for (let card of this.cards) {
            card.draw(skin);
        }
    }
    // This is public so cardpilecombiner can put the bottom card of a pile on top
    //  of this one in the place that the next card would be.
    cardPosition(index) {
        return [this.cardSpacing * index * Math.cos(this.cardAngle), this.cardSpacing * index * Math.sin(this.cardAngle)];
    }
}
exports.CardPile = CardPile;
class CardPileCombiner {
    constructor(piles = []) {
        this.position = new display_1.Position();
        this.position.addUpdateListener(() => {
            this.updatePiles(0, this.piles.length);
        });
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
    register(pile) {
        pile.position.addUpdateListener(() => {
            this.updatePiles(this.piles.indexOf(pile) + 1, this.piles.length);
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
    updatePiles(start, end) {
        for (let i = start; i < end; i++) {
            this.piles[i].position.update();
        }
    }
    draw(skin) {
        for (let pile of this.piles) {
            pile.draw(skin);
        }
    }
}
exports.CardPileCombiner = CardPileCombiner;
var decks;
(function (decks) {
    function std52() {
        let r = [];
        for (let suit of Suit) {
            for (let value of CardValue) {
                r.push(new Card(value, suit));
            }
        }
        return new CardPile(r);
    }
    decks.std52 = std52;
})(decks || (exports.decks = decks = {}));
