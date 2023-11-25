import { NewPos } from "../common/display.js";
import { Table } from "../common/table.js";
export class GameClient {
    constructor(canvas, ctx, skin, width, height) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.began = false;
        this.remove = () => { };
        this.pendingAnimations = [];
        this.currentAnimations = [];
        this.clickListeners = [];
        this.widthVal = width;
        this.heightVal = height;
        this.table = new Table([], skin);
        this.setCanvasSize = this.setCanvasSize.bind(this);
        this.frame = this.frame.bind(this);
        this.setCanvasSize();
        this.canvas.addEventListener("click", event => {
            console.log("click");
            this.table.maybeClick(new NewPos(event.offsetX, event.offsetY), event2 => {
                for (let listener of this.clickListeners) {
                    listener(event2);
                }
            });
        });
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
            console.log("doing current animation");
            const action = this.currentAnimations[i];
            if (action.isCompleted(time)) {
                action.complete();
                this.currentAnimations.splice(i--, 1);
                if (action.next !== undefined) {
                    this.doAction(action.next);
                }
            }
            else {
                action.draw(time);
            }
        }
        for (let action of this.pendingAnimations) {
            console.log("processing pending animation");
            action.start(time);
            this.currentAnimations.push(action);
        }
        this.pendingAnimations.length = 0;
        requestAnimationFrame(this.frame);
    }
    doAction(action) {
        if (action.duration === 0) {
            action.complete();
            if (action.next !== undefined) {
                this.doAction(action.next);
            }
        }
        else if (action.hasStarted) {
            this.currentAnimations.push(action);
        }
        else {
            this.pendingAnimations.push(action);
        }
    }
    addClickListener(callback) {
        this.clickListeners.push(callback);
    }
    removeClickListener(callback) {
        const i = this.clickListeners.indexOf(callback);
        if (i !== -1) {
            this.clickListeners.splice(i, 1);
        }
    }
}
