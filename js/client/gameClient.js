import { Table } from "../common/table.js";
export class GameClient {
    constructor(canvas, ctx, skin, width, height) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.began = false;
        this.remove = () => { };
        this.widthVal = width;
        this.heightVal = height;
        this.table = new Table([], skin);
        this.setCanvasSize = this.setCanvasSize.bind(this);
        this.frame = this.frame.bind(this);
        this.setCanvasSize();
    }
    get width() {
        return this.widthVal;
    }
    set width(val) {
        this.widthVal = val;
        this.setCanvasSize();
    }
    get height() {
        return this.heightVal;
    }
    set height(val) {
        this.heightVal = val;
        this.setCanvasSize();
    }
    setCanvasSize() {
        console.log("setting size");
        if (this.remove !== undefined) {
            this.remove();
        }
        this.canvas.width = this.width * devicePixelRatio;
        this.canvas.height = this.height * devicePixelRatio;
        this.canvas.style.width = this.width + "px";
        this.canvas.style.height = this.height + "px";
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        const media = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
        media.addEventListener("change", this.setCanvasSize);
        this.remove = () => media.removeEventListener("change", this.setCanvasSize);
    }
    begin() {
        if (this.began) {
            throw new Error("Cannot begin game more than once");
        }
        else {
            this.began = true;
            requestAnimationFrame(this.frame);
        }
    }
    frame() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.table.draw();
        requestAnimationFrame(this.frame);
    }
}
