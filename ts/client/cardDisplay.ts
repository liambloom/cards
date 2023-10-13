import { Card } from "../common/cards.js";
import { Skin } from "../common/display.js";

export default function(canvas: HTMLCanvasElement) {
    let ctx = canvas.getContext("2d")!;

    return {
        baseSkin: {
            cardWidth: 100,
            cardHeight: 300,

            drawCard(card: Card) {
                ctx.fillStyle = "white";
                ctx.fillRect(card.position.x, card.position.y, 100, 300);
                ctx.strokeStyle = "black";
                ctx.fillRect(card.position.x, card.position.y, 100, 300);
            }
        } satisfies Skin
        
    }
}