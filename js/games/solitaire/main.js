import { Card, CardPile, CardPileCombiner, decks } from "../../common/cards.js";
import cardDisplayInit from "../../client/cardDisplay.js";
import { TableRow, TableSlot } from "../../common/table.js";
import { GameClient } from "../../client/gameClient.js";
import { FlipAction, FlipDirection, MoveAction, TIME_FUNCTIONS } from "../../common/game.js";
const { linear } = TIME_FUNCTIONS;
const canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");
// TODO: Fix card movement. Currently only moves one card, even if it has cards on top of it
const { baseSkin: skin } = cardDisplayInit(ctx);
const easy = new URLSearchParams(location.search).get("easyMode") === "true" ? true : false;
console.time();
const deck = decks.std52();
const gamePiles = new TableRow();
deck.shuffle();
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
                if (e.currentTarget === move.targetContainer.children[move.targetContainer.children.length - 1]) {
                    gameClient.doAction(move);
                    selectionBlocker = true;
                    break;
                }
            }
        }
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
            if (destCard.faceUp /*&& destCard.face.value.value === e.currentTarget.face.value.value + 1 && destCard.face.suit.color !== e.currentTarget.face.suit.color*/) {
                if (easy) {
                    destCard.glow = "green";
                }
                const action = new MoveAction({
                    timeFunction: n => n,
                    // duration: 700,
                    speed: 0.7,
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
                        timeFunction: linear,
                        duration: 0,
                        subjectContainer: startFaceDownCards,
                        subject,
                        targetContainer: startCardPile,
                        targetIndex: 0,
                        skin: gameClient.table.skin,
                        source: null,
                        next: new FlipAction({
                            timeFunction: linear,
                            duration: 1000,
                            subjectContainer: startCardPile,
                            subject,
                            skin: gameClient.table.skin,
                            source: null,
                            direction: FlipDirection.Vertical,
                        })
                    });
                }
                // action.next = new Action();
                currentMoves.push(action);
            }
        }
    }
    selectionBlocker = false;
});
gameClient.begin();
