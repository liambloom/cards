import { CardPile, CardPileCombiner, decks } from "../../common/cards";
import cardDisplayInit from "../../client/cardDisplay";

const canvas = document.getElementById("game") as HTMLCanvasElement;

function setCanvasSize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", setCanvasSize);
setCanvasSize();

const { baseSkin } = cardDisplayInit(canvas);

const deck = decks.std52();
const gamePiles = [];

deck.shuffle();

for (let i = 0; i < 7; i++) {
    const topCard = deck.cards.pop()!;
    topCard.faceUp = true;

    const combiner = new CardPileCombiner([
        new CardPile(deck.cards.splice(deck.cards.length - i, i)), 
        new CardPile([topCard])
    ]);

    combiner.position.coordinates = [350 * i + 50, 50]

    gamePiles.push(combiner);
}

