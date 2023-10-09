"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(canvas) {
    let ctx = canvas.getContext("2d");
    return {
        baseSkin(card) {
            ctx.fillStyle = "white";
            ctx.fillRect(card.position.x, card.position.y, 100, 300);
            ctx.strokeStyle = "black";
            ctx.fillRect(card.position.x, card.position.y, 100, 300);
        }
    };
}
exports.default = default_1;
