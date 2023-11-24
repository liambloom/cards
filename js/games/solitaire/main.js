import { Card, CardPile, CardPileCombiner, decks } from "../../common/cards.js";
import cardDisplayInit from "../../client/cardDisplay.js";
import { TableRow, TableSlot } from "../../common/table.js";
import { GameClient } from "../../client/gameClient.js";
import { Action } from "../../common/game.js";
import { GameAnimation } from "../../client/animation.js";
const canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
const { baseSkin: skin } = cardDisplayInit(ctx);
const easy = new URLSearchParams(location.search).get("easyMode") === "true" ? true : false;
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
const gameClient = new GameClient(canvas, ctx, skin, 1000, 1000);
gameClient.table.children.push(gamePiles);
let currentSelected = null;
let currentMoves = [];
gameClient.addClickListener(e => {
    let didMove = false;
    if (e.currentTarget instanceof Card) {
        for (let move of currentMoves) {
            console.log(e.currentTarget);
            console.log(move.targetContainer.children[move.targetContainer.children.length - 1]);
            if (e.currentTarget === move.targetContainer.children[move.targetContainer.children.length - 1]) {
                gameClient.doAction(move);
                didMove = true;
                break;
            }
        }
    }
    console.log(currentSelected);
    if (currentSelected && (!(e.target instanceof Card) || e.target !== currentSelected)) {
        console.log("clear");
        currentSelected.glow = null;
        currentSelected = null;
        if (easy) {
            for (let move of currentMoves) {
                move.targetContainer.children[move.targetContainer.children.length - 1].glow = null;
            }
        }
        currentMoves.length = 0;
    }
    if (e.currentTarget instanceof Card && !didMove) {
        currentSelected = e.currentTarget;
        currentSelected.glow = "cyan";
        for (let pileContainer of gamePiles.children) {
            let parent = gameClient.table;
            let pile = pileContainer.content;
            if (pile === null) {
                continue;
            }
            while (!(pile instanceof Card)) {
                parent = pile;
                pile = pile === null || pile === void 0 ? void 0 : pile.children[pile.children.length - 1];
            }
            if (pile.faceUp && pile.face.value.value === e.currentTarget.face.value.value + 1 && pile.face.suit.color !== e.currentTarget.face.suit.color) {
                if (easy) {
                    pile.glow = "green";
                }
                currentMoves.push(new Action(new GameAnimation(n => n, 1000), e.targetStack[1], e.currentTarget, parent, parent.children.length, undefined));
                console.log(parent);
            }
        }
    }
    didMove = false;
});
console.log("drawing");
console.log(canvas.width);
gameClient.begin();
console.log("done");
