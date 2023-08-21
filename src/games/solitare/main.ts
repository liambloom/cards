import { CardPile, CardPileCombiner, decks } from "../../common/cards";

const deck = decks.std52();
const gamePiles = [];

deck.shuffle();

for (let i = 0; i < 7; i++) {
    const topCard = deck.cards.pop()!;
    topCard.faceUp = true;

    gamePiles.push(new CardPileCombiner([
        new CardPile(deck.cards.splice(deck.cards.length - i, i)), 
        new CardPile([topCard])
    ]));
}

