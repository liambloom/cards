import { CardPile, CardPileCombiner, decks } from "../../common/cards.js";
import cardDisplayInit from "../../client/cardDisplay.js";
import { Table, TableRow, TableSlot } from "../../common/table.js";
import { GameClient } from "../../client/gameClient.js";
import { DEBUG_SKIN } from "../../common/display.js";

const canvas = document.getElementById("game") as HTMLCanvasElement;
let ctx = canvas.getContext("2d")!;



const { baseSkin } = cardDisplayInit(ctx);
const skin = new URLSearchParams(new URL(location.href).searchParams).get("useDebug") === "true" ? DEBUG_SKIN : baseSkin;

console.time();
console.log("Making deck");
const deck = decks.std52();
console.log("Deck made")
const gamePiles = new TableRow();

console.log("shuffling deck")
deck.shuffle();
console.log("done shuffling");

for (let i = 0; i < 7; i++) {
    const topCard = deck.children.pop()!;
    topCard.faceUp = true;

    const combiner = new CardPileCombiner([
        new CardPile(deck.children.splice(deck.children.length - i, i), skin.minValueVisibleHeight, Math.PI / 2), 
        new CardPile([topCard], Math.min(skin.minValueVisibleHeight * 2, skin.cardHeight), Math.PI / 2)
    ]);

    gamePiles.children.push(new TableSlot(combiner));
}

const gameClient = new GameClient(canvas, ctx, skin, 1000, 1000);
gameClient.table.children.push(gamePiles);

console.log("drawing");
console.log(canvas.width);
gameClient.begin();
console.log("done");

