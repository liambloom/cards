import { CardPile, CardPileCombiner, decks } from "../../common/cards.js";
import cardDisplayInit from "../../client/cardDisplay.js";
import { Table, TableRow, TableSlot } from "../../common/table.js";
const canvas = document.getElementById("game");
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", setCanvasSize);
setCanvasSize();
const { baseSkin } = cardDisplayInit(canvas);
console.log("Making deck");
const deck = decks.std52();
console.log("Deck made");
const gamePiles = new TableRow();
console.log("shuffling deck");
deck.shuffle();
console.log("done shuffling");
for (let i = 0; i < 7; i++) {
    const topCard = deck.children.pop();
    topCard.faceUp = true;
    const combiner = new CardPileCombiner([
        new CardPile(deck.children.splice(deck.children.length - i, i)),
        new CardPile([topCard])
    ]);
    combiner.position.coordinates = [350 * i + 50, 50];
    gamePiles.children.push(new TableSlot(combiner));
}
const table = new Table([gamePiles], baseSkin);
table.draw();
