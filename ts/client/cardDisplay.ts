import { Card } from "../common/cards.js";
import { Skin, NewPos, HitBox, Rectangle } from "../common/display.js";

export default function(ctx: CanvasRenderingContext2D) {
    return {
        baseSkin: {
            cardWidth: 100,
            cardHeight: 100,
            minValueVisibleHeight: 40,
            minValueVisibleWidth: 40,
            ctx,
        } satisfies Skin
        
    }
}