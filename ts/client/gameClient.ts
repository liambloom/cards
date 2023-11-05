import { Skin } from "../common/display.js";
import { Action } from "../common/game.js";
import { Table } from "../common/table.js";
import { GameAnimation } from "./animation.js";

export class GameClient {
    private began: boolean = false;
    public readonly table: Table;
    private widthVal: number;
    private heightVal: number;
    private remove: () => void = () => {};
    private readonly pendingAnimations: Action[] = [];
    private readonly currentAnimations: Action[]= [];

    public constructor(public readonly canvas: HTMLCanvasElement, public readonly ctx: CanvasRenderingContext2D, skin: Skin, width: number, height: number) {
        this.widthVal = width;
        this.heightVal = height;
        this.table = new Table([], skin);

        this.setCanvasSize = this.setCanvasSize.bind(this);
        this.frame = this.frame.bind(this);
        this.setCanvasSize();
    }

    public get width() {
        return this.widthVal;
    }

    public set width(val: number) {
        this.widthVal = val;
        this.setCanvasSize();
    }

    public get height() {
        return this.heightVal;
    }

    public set height(val: number) {
        this.heightVal = val;
        this.setCanvasSize();
    }

    private setCanvasSize() {
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


    public begin() {
        if (this.began) {
            throw new Error("Cannot begin game more than once");
        }
        else {
            this.began = true;
            requestAnimationFrame(this.frame);
        }
    }

    private frame(time: number) {
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
            action.animation.start(action.subject, time, action.subject.latestPosition, 
                action.targetContainer.calculateChildPosition(action.targetIndex, this.table.skin));
            this.currentAnimations.push(action);
        }
        this.pendingAnimations.length = 0;

        requestAnimationFrame(this.frame);
    }

    public doAction(action: Action): void {
        if (action.animation.duration === 0) {
            action.complete();
        }
        else {
            this.pendingAnimations.push(action);
        }
    }
}