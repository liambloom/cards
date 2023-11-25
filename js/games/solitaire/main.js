import { Card, CardPile, CardPileCombiner, decks } from "../../common/cards.js";
import cardDisplayInit from "../../client/cardDisplay.js";
import { TableRow, TableSlot } from "../../common/table.js";
import { GameClient } from "../../client/gameClient.js";
import { FlipAction, FlipDirection, MoveAction } from "../../common/game.js";
const canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
// TODO: Current Issues
// - Once a card has been moved, everything stops working, I think an infinite loop begins, but I don't know where or why it doesn't throw a StackOverflowError
// - Animations always have a start position of (0, 0)
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
// For easy debugging
window.gameClient = gameClient;
let currentSelected = null;
let currentMoves = [];
gameClient.addClickListener(e => {
    let selectionBlocker = false;
    if (currentSelected && (e.target !== currentSelected || (selectionBlocker || (selectionBlocker = e.currentTarget === currentSelected)))) {
        if (e.currentTarget instanceof Card) {
            for (let move of currentMoves) {
                console.log(e.currentTarget);
                console.log(move.targetContainer.children[move.targetContainer.children.length - 1]);
                if (e.currentTarget === move.targetContainer.children[move.targetContainer.children.length - 1]) {
                    gameClient.doAction(move);
                    selectionBlocker = true;
                    break;
                }
            }
        }
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
    if (!selectionBlocker && e.currentTarget instanceof Card) {
        currentSelected = e.currentTarget;
        currentSelected.glow = "cyan";
        for (let pileContainer of gamePiles.children) {
            const destPileCombiner = pileContainer.content;
            const destCardPile = destPileCombiner.children[1];
            if (destCardPile.children.length === 0) {
                continue;
            }
            const destCard = destCardPile.children[destCardPile.children.length - 1];
            if (destCard.faceUp && destCard.face.value.value === e.currentTarget.face.value.value + 1 && destCard.face.suit.color !== e.currentTarget.face.suit.color) {
                if (easy) {
                    destCard.glow = "green";
                }
                const action = new MoveAction({
                    timeFunction: n => n,
                    duration: 700,
                    subjectContainer: e.targetStack[1],
                    subject: e.currentTarget,
                    targetContainer: destCardPile,
                    targetIndex: destCardPile.children.length,
                    skin: gameClient.table.skin,
                    source: null,
                });
                const startCardPile = e.targetStack[1];
                const startFaceDownCards = e.targetStack[2].children[0];
                if (startCardPile.children.length === 1 && startFaceDownCards.children.length !== 0) {
                    const subject = startFaceDownCards.children[startFaceDownCards.children.length - 1];
                    action.next = new MoveAction({
                        timeFunction: n => n,
                        duration: 0,
                        subjectContainer: startFaceDownCards,
                        subject,
                        targetContainer: startCardPile,
                        targetIndex: 0,
                        skin: gameClient.table.skin,
                        source: null,
                        next: new FlipAction({
                            timeFunction: n => n,
                            duration: 1000,
                            subjectContainer: startCardPile,
                            subject,
                            skin: gameClient.table.skin,
                            source: null,
                            direction: FlipDirection.Vertical,
                        }),
                    });
                }
                // action.next = new Action();
                currentMoves.push(action);
                console.log(parent);
            }
        }
    }
    selectionBlocker = false;
});
console.log("drawing");
console.log(canvas.width);
gameClient.begin();
console.log("done");
