import { Card } from "../common/cards.js";
import { Skin, NewPos } from "../common/display.js";

export default function(ctx: CanvasRenderingContext2D) {
    return {
        baseSkin: {
            cardWidth: 100,
            cardHeight: 100,
            minValueVisibleHeight: 40,
            minValueVisibleWidth: 40,

            drawCard(card: Card, position: NewPos) {
                ctx.fillStyle = card.faceUp ? "white" : "darkred";
                ctx.fillRect(position.x, position.y, this.cardWidth, this.cardHeight);
                ctx.strokeStyle = "black";
                ctx.strokeRect(position.x, position.y, this.cardWidth, this.cardHeight);
                if (card.faceUp) {
                    ctx.fillStyle = card.face.suit.color;
                    ctx.textBaseline = "top";
                    ctx.font = "24px Serif";
                    ctx.fillText(card.face.value.symbol + card.face.suit.symbol, position.x + 10, position.y + 10);
                }
            }
        } satisfies Skin
        
    }
}