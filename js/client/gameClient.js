import { NewPos } from "../common/display.js";
import { Table } from "../common/table.js";
import { Card } from "../common/cards.js";
export class GameClient {
    constructor(canvas, ctx, skin, width, height) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.began = false;
        this.remove = () => { };
        this.pendingAnimations = [];
        this.currentAnimations = [];
        this.clickListeners = [];
        this.skippedFrames = 0;
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
    get selectionHandler() {
        return this.selectionHandlerInner;
    }
    set selectionHandler(value) {
        if (this.selectionHandler) {
            this.removeClickListener(this.selectionClickListener);
            this.selectionHandler.gameClient = undefined;
        }
        this.selectionHandlerInner = value;
        if (value) {
            this.addClickListener(this.selectionClickListener = value.onClick.bind(value));
            value.gameClient = this;
        }
    }
    setCanvasSize() {
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
        // time = time / ;
        // if ()
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = "#FF6666";
        this.ctx.fillRect(0, 0, this.width, this.height);
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
export class SingleCardSelector {
    constructor() {
        this.currentSelected = null;
        this.currentMoves = [];
    }
    onClick(e) {
        console.log("click");
        if (!this.gameClient) {
            throw new Error("Game client undefined");
        }
        let selectionBlocker = false;
        if (this.currentSelected && (e.target !== this.currentSelected || (selectionBlocker || (selectionBlocker = e.currentTarget === this.currentSelected)))) {
            for (let move of this.currentMoves) {
                if (e.currentTarget === move.trigger) {
                    for (let action of move.actions) {
                        this.gameClient.doAction(action);
                    }
                    selectionBlocker = true;
                    break;
                }
            }
            this.currentSelected.glow = null;
            this.currentSelected = null;
            // if (this.showLegalMoves) {
            //     for (let move of this.currentMoves) {
            //         move.trigger.glow = null;
            //     }
            // }
            this.currentMoves.length = 0;
        }
        if (!selectionBlocker && e.currentTarget instanceof Card && this.isSelectable(e.currentTarget, e.targetStack)) {
            this.selectInner(e.currentTarget, e.targetStack);
        }
    }
    select(card) {
        this.selectInner(card, this.gameClient.table.pathTo(card));
    }
    selectInner(card, location) {
        this.currentSelected = card;
        card.glow = "cyan";
        this.currentMoves = this.getLegalMoves(card, location);
        // if (this.showLegalMoves) {
        //     for (let { trigger } of this.currentMoves) {
        //         trigger.glow = "green";
        //     }
        // }
    }
    isSelectable(card, location) {
        return card instanceof Card && this.isCardSelectable(card, location);
    }
}
