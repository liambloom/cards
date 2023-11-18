import { Table } from "../common/table.js";
export class GameClient {
    constructor(canvas, ctx, skin, width, height) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.began = false;
        this.remove = () => { };
        this.pendingAnimations = [];
        this.currentAnimations = [];
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
    frame(time) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.table.draw();
        for (let i = 0; i < this.currentAnimations.length; i++) {
            const action = this.currentAnimations[i];
            if (action.animation.isCompleted(time)) {
                action.complete();
                this.currentAnimations.splice(i--, 1);
            }
            else {
                action.animation.draw(this.table.skin, time);
            }
        }
        for (let action of this.pendingAnimations) {
            action.animation.start(action.subject, time, action.subject.latestPosition, action.targetContainer.calculateChildPosition(action.targetIndex, this.table.skin));
            this.currentAnimations.push(action);
        }
        this.pendingAnimations.length = 0;
        requestAnimationFrame(this.frame);
    }
    doAction(action) {
        if (action.animation.duration === 0) {
            action.complete();
        }
        else {
            this.pendingAnimations.push(action);
        }
    }
}
