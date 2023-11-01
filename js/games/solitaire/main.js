import { CardPile, CardPileCombiner, decks } from "../../common/cards.js";
import cardDisplayInit from "../../client/cardDisplay.js";
import { Table, TableRow, TableSlot } from "../../common/table.js";
import { DEBUG_SKIN } from "../../common/display.js";
const canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
let remove;
function setCanvasSize() {
    if (remove !== undefined) {
        remove();
    }
    const width = 1000;
    const height = 600;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const media = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    media.addEventListener("change", setCanvasSize);
    remove = () => media.removeEventListener("change", setCanvasSize);
    table.draw();
}
const { baseSkin } = cardDisplayInit(ctx);
const skin = new URLSearchParams(new URL(location.href).searchParams).get("useDebug") === "true" ? DEBUG_SKIN : baseSkin;
console.time();
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
        new CardPile(deck.children.splice(deck.children.length - i, i), skin.minValueVisibleHeight, Math.PI / 2),
        new CardPile([topCard], Math.min(skin.minValueVisibleHeight * 2, skin.cardHeight), Math.PI / 2)
    ]);
    gamePiles.children.push(new TableSlot(combiner));
}
const table = new Table([gamePiles], skin);
console.log("drawing");
console.log(canvas.width);
table.draw();
console.log("done");
window.addEventListener("resize", setCanvasSize);
setCanvasSize();
