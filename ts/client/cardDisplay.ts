import { Card } from "../common/cards";

export default function(canvas: HTMLCanvasElement) {
    let ctx = canvas.getContext("2d")!;

    return {
        baseSkin(card: Card) {
            ctx.fillStyle = "white";
            ctx.fillRect(card.position.x, card.position.y, 100, 300);
            ctx.strokeStyle = "black";
            ctx.fillRect(card.position.x, card.position.y, 100, 300);
        }
    }
}