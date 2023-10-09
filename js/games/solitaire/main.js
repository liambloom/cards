"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cards_1 = require("../../common/cards");
const cardDisplay_1 = __importDefault(require("../../client/cardDisplay"));
const { baseSkin } = (0, cardDisplay_1.default)(document.getElementById("game"));
const deck = cards_1.decks.std52();
const gamePiles = [];
deck.shuffle();
for (let i = 0; i < 7; i++) {
    const topCard = deck.cards.pop();
    topCard.faceUp = true;
    const combiner = new cards_1.CardPileCombiner([
        new cards_1.CardPile(deck.cards.splice(deck.cards.length - i, i)),
        new cards_1.CardPile([topCard])
    ]);
    combiner.position.coordinates = [350 * i + 50, 50];
    gamePiles.push(combiner);
}
