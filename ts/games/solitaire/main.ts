import { Card, CardPile, CardPileCombiner, decks } from "../../common/cards.js";
import cardDisplayInit from "../../client/cardDisplay.js";
import { Table, TableRow } from "../../common/table.js";
import { SingleCardSelector, GameClient, Move } from "../../client/gameClient.js";
import { FlipAction, FlipDirection, MoveAction, TIME_FUNCTIONS } from "../../common/game.js";
import { Parent, HoldingParent, Element } from "../../common/display.js";

const { linear } = TIME_FUNCTIONS;
const CARD_MOVE_SPEED = 0.7;

const canvas = document.getElementById("game") as HTMLCanvasElement;
let ctx = canvas.getContext("2d")!;

const { baseSkin: skin } = cardDisplayInit(ctx);
const easy = new URLSearchParams(location.search).get("easyMode") === "true" ? true : false;

console.time();
const deck = decks.std52();
const gamePiles = new TableRow();

deck.shuffle();

for (let i = 0; i < 7; i++) {
    const topCard = deck.children.pop()!;
    topCard.faceUp = true;

    const combiner = new CardPileCombiner([
        new CardPile(deck.children.splice(deck.children.length - i, i), skin.minValueVisibleHeight, Math.PI / 2), 
        new CardPile([topCard], Math.min(skin.minValueVisibleHeight * 2, skin.cardHeight), Math.PI / 2)
    ]);

    gamePiles.children.push(combiner);
}

const gameClient = new GameClient(canvas, ctx, skin, 1000, 1000);
gameClient.table.children.push(gamePiles);

// For easy debugging
(window as unknown as {gameClient: GameClient}).gameClient = gameClient;

gameClient.selectionHandler = new class extends SingleCardSelector {
    public override getLegalMoves(card: Card, location: Element[]): Move[] {
        const r = [];
        for (let pileContainer of gamePiles.children) {
            const destPileCombiner = pileContainer as CardPileCombiner;
            const destCardPile = destPileCombiner.children[1];

            if (destCardPile.children.length === 0) {
                continue;
            }

            const destCard = destCardPile.children[destCardPile.children.length - 1];

            if (destCard.faceUp /*&& destCard.face.value.value === e.currentTarget.face.value.value + 1 && destCard.face.suit.color !== e.currentTarget.face.suit.color*/) {
                const startCardPile = location[1] as CardPile;
                const actions = [];
                const action = new MoveAction({
                    timeFunction: linear,
                    speed: CARD_MOVE_SPEED,
                    subjectContainer: startCardPile, 
                    subject: card, 
                    targetContainer: destCardPile, 
                    targetIndex: destCardPile.children.length, 
                    skin: gameClient.table.skin, 
                    source: null,
                });
                actions.push(action);

                const startFaceDownCards = (location[2] as CardPileCombiner).children[0];
                if (startCardPile.children.indexOf(card) === 0 && startFaceDownCards.children.length !== 0) {
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
                    })});
                    
                }
                for (let i = startCardPile.children.indexOf(card) + 1, j = 1; i < startCardPile.children.length; i++, j++) {
                    actions.push(new MoveAction({
                        timeFunction: linear,
                        speed: CARD_MOVE_SPEED,
                        subjectContainer: startCardPile, 
                        subject: startCardPile.children[i], 
                        targetContainer: destCardPile, 
                        targetIndex: destCardPile.children.length + j, 
                        skin: gameClient.table.skin, 
                        source: null,
                    }))
                }

                r.push({actions, trigger: destCard});
            }
        }
        return r;
    }

    public override isCardSelectable(card: Card): boolean {
        return card.faceUp;
    }
}

gameClient.begin();
