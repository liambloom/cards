var _a, _b;
import { Element, NewPos, Parent, HitBoxEvent, Rectangle } from "./display.js";
export class Card extends Element {
    constructor(value, suit, faceUp = false) {
        super();
        this.faceUp = faceUp;
        this.glow = null;
        this.face = new CardFace(value, suit);
    }
    draw(skin, position) {
        // console.log("draw");
        skin.ctx.fillStyle = this.faceUp ? "white" : "darkred";
        if (this.glow) {
            skin.ctx.shadowColor = this.glow;
            skin.ctx.shadowBlur = 10;
        }
        skin.ctx.fillRect(position.x, position.y, skin.cardWidth, skin.cardHeight);
        skin.ctx.shadowBlur = 0;
        skin.ctx.strokeStyle = "black";
        skin.ctx.strokeRect(position.x, position.y, skin.cardWidth, skin.cardHeight);
        if (this.faceUp) {
            skin.ctx.fillStyle = this.face.suit.color;
            skin.ctx.textBaseline = "top";
            skin.ctx.font = "24px Serif";
            skin.ctx.fillText(this.face.value.symbol + this.face.suit.symbol, position.x + 10, position.y + 10);
        }
        this.latestHitbox = new Rectangle(position, skin.cardWidth, skin.cardHeight);
    }
    maybeClick(pos, callback, targetStack) {
        var _c;
        if ((_c = this.latestHitbox) === null || _c === void 0 ? void 0 : _c.checkHit(pos)) {
            const localTargetStack = [this, ...targetStack];
            callback(new HitBoxEvent(this, this, localTargetStack));
            return localTargetStack;
        }
        return null;
    }
}
export class CardFace {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
    }
}
export class CardValue {
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
export var Color;
(function (Color) {
    Color["Black"] = "black";
    Color["Red"] = "red";
})(Color || (Color = {}));
export class Suit {
    static [Symbol.iterator]() {
        return this.values[Symbol.iterator]();
    }
    constructor(name, symbol, color) {
        this.name = name;
        this.symbol = symbol;
        this.color = color;
    }
}
_b = Suit;
Suit.Spades = new Suit("Spades", "\u2660", Color.Black);
Suit.Hearts = new Suit("Hearts", "\u2661", Color.Red);
Suit.Diamonds = new Suit("Diamonds", "\u2662", Color.Red);
Suit.Clubs = new Suit("Clubs", "\u2663", Color.Black);
Suit.values = [_b.Spades, _b.Hearts, _b.Diamonds, _b.Clubs];
export class CardPile extends Parent {
    constructor(cards = [], cardSpacing = 0, cardAngle = 0) {
        super(cards);
        this.cardSpacing = cardSpacing;
        this.cardAngle = cardAngle;
    }
    shuffle() {
        // https://stackoverflow.com/a/12646864/11326662
        for (let i = this.children.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // console.log(`Shuffling: i=${i}, j=${j}`);
            [this.children[i], this.children[j]] = [this.children[j], this.children[i]];
        }
    }
    // This is public so cardpilecombiner can put the bottom card of a pile on top
    //  of this one in the place that the next card would be.
    calculateChildPosition(index) {
        return new NewPos(this.latestPosition.x + this.cardSpacing * index * Math.cos(this.cardAngle), this.latestPosition.y + this.cardSpacing * index * Math.sin(this.cardAngle));
    }
}
export class CardPileCombiner extends Parent {
    constructor(piles = []) {
        super(piles);
    }
    // protected override register(pile: CardPile): void {
    //     super.register(pile);
    //     pile.addUpdateListener(() => {
    //         const index = this.children.indexOf(pile);
    //         this.updateChildPositions(index);
    //     });
    // }
    calculateChildPosition(index, skin) {
        if (index === 0) {
            return this.latestPosition;
        }
        else {
            const under = this.children[index - 1];
            return under.calculateChildPosition(under.children.length);
        }
    }
}
export var decks;
(function (decks) {
    function std52() {
        var _c;
        let r = [];
        for (let suit of Suit) {
            for (let value of CardValue) {
                r.push(new Card(value, suit));
            }
        }
        return new CardPile(r.slice(0, +((_c = new URLSearchParams(new URL(location.href).searchParams).get("deckSize")) !== null && _c !== void 0 ? _c : 52)));
    }
    decks.std52 = std52;
})(decks || (decks = {}));
