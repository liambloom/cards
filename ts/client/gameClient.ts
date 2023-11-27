import { HitBoxEvent, HoldingParent, NewPos, Skin } from "../common/display.js";
import { Action, MoveAction } from "../common/game.js";
import { Table } from "../common/table.js";
import { Element } from "../common/display.js";

export class GameClient {
    private began: boolean = false;
    public readonly table: Table;
    private widthVal: number;
    private heightVal: number;
    private remove: () => void = () => {};
    private readonly pendingAnimations: Action<Element>[] = [];
    private readonly currentAnimations: Action<Element>[]= [];
    private readonly clickListeners: ((e: HitBoxEvent) => void)[] = [];

    public constructor(public readonly canvas: HTMLCanvasElement, public readonly ctx: CanvasRenderingContext2D, skin: Skin, width: number, height: number) {
        this.widthVal = width;
        this.heightVal = height;
        this.table = new Table([], skin);

        this.setCanvasSize = this.setCanvasSize.bind(this);
        this.frame = this.frame.bind(this);
        this.setCanvasSize();

        this.canvas.addEventListener("click", event => {
            this.table.maybeClick(new NewPos(event.offsetX, event.offsetY), event2 => {
                for (let listener of this.clickListeners) {
                    listener(event2);
                }
            })
        });
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

    private skippedFrames = 0;

    private frame(time: number) {
        // time = time / ;
        // if ()

        if (this.currentAnimations.length || this.pendingAnimations.length) {
            console.log("frame start: " + performance.now());
        }
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = "#FF6666"
        this.ctx.fillRect(0, 0, this.width, this.height)

        for (let i = 0; i < this.currentAnimations.length; i++) {
            const action = this.currentAnimations[i];

            if (action.isCompleted(time)) {
                action.complete();
                this.currentAnimations.splice(i--, 1);
                if (action.next !== undefined) {
                    this.doAction(action.next);
                }
            }
        }

        this.table.draw();

        for (let i = 0; i < this.currentAnimations.length; i++) {
            this.currentAnimations[i].draw(time);
        }

        for (let action of this.pendingAnimations) {
            if (!action.hasStarted) {
                action.start(time);
            }
            this.currentAnimations.push(action);
        }
        this.pendingAnimations.length = 0;

        if (this.currentAnimations.length || this.pendingAnimations.length) {
            console.log("frame end: " + performance.now());
        }

        requestAnimationFrame(this.frame);
    }

    public doAction(action: Action<Element>): void {
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

    public addClickListener(callback: (e: HitBoxEvent) => void): void {
        this.clickListeners.push(callback);
    }

    public removeClickListener(callback: (e: HitBoxEvent) => void): void {
        const i = this.clickListeners.indexOf(callback);
        if (i !== -1) {
            this.clickListeners.splice(i, 1);
        }
    }
}