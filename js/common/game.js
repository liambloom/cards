import { NewPos, Parent } from "./display.js";
export class Player {
    constructor() {
        this.playerId = ""; //uuid();
    }
}
export class TheVoid extends Parent {
    calculateChildPosition(index, skin) {
        throw new Error("Elements in the void have no position");
    }
}
export class Action {
    constructor(data) {
        this.subject = data.subject;
        this.subjectContainer = data.subjectContainer;
        this.source = data.source;
        this.skin = data.skin;
        this.duration = data.duration;
        this.timeFunction = data.timeFunction;
        this.next = data.next;
    }
    get hasStarted() {
        return this.startTime !== undefined;
    }
    isCompleted(time) {
        return this.startTime !== undefined && this.startTime + this.duration <= time;
    }
    start(time) {
        if (this.hasStarted) {
            throw new Error("Cannot start animation more than once");
        }
        if (this.subjectContainer.children.indexOf(this.subject) === -1) {
            throw new Error("Animation cannot begin because subject has moved");
        }
        this.startTime = time;
    }
    draw(time) {
        if (this.startTime === undefined) {
            throw new Error("Cannot draw animation before it has started");
        }
        this.drawProgress(this.timeFunction((time - this.startTime) / this.duration));
    }
    complete() {
        if (this.next !== undefined) {
            this.next.start(this.startTime + this.duration);
        }
    }
}
export var FlipDirection;
(function (FlipDirection) {
    FlipDirection[FlipDirection["Horizontal"] = 0] = "Horizontal";
    FlipDirection[FlipDirection["Vertical"] = 1] = "Vertical";
})(FlipDirection || (FlipDirection = {}));
export class FlipAction extends Action {
    constructor(data) {
        super(data);
        this.direction = data.direction;
    }
    start(time) {
        console.log(performance.now());
        super.start(time);
        this.targetFace = !this.subject.faceUp;
    }
    complete() {
        console.log(performance.now());
        this.subject.faceUp = this.targetFace;
        super.complete();
    }
    drawProgress(progress) {
        const origTransform = this.skin.ctx.getTransform();
        if (progress > .5) {
            this.subject.faceUp = this.targetFace;
        }
        const scale = Math.abs(Math.cos(progress * Math.PI));
        this.skin.ctx.translate(this.subject.latestPosition.x, this.subject.latestPosition.y);
        if (this.direction === FlipDirection.Horizontal) {
            this.skin.ctx.translate(this.skin.cardWidth * (1 - scale) / 2, 0);
            this.skin.ctx.scale(scale, 1);
        }
        else {
            this.skin.ctx.translate(0, this.skin.cardHeight * (1 - scale) / 2);
            this.skin.ctx.scale(1, scale);
        }
        this.skin.ctx.translate(-this.subject.latestPosition.x, -this.subject.latestPosition.y);
        this.subject.draw(this.skin, this.subject.latestPosition);
        this.skin.ctx.setTransform(origTransform);
    }
}
export class MoveAction extends Action {
    constructor(data) {
        super(data);
        if ((data.subjectContainer instanceof TheVoid || data.targetContainer instanceof TheVoid) && data.duration !== 0) {
            throw new Error(`Attempted to move ${data.subject} ${data.subjectContainer instanceof TheVoid ? "from" : "into"}`
                + ` with an animation of duration ${data.duration}, you must use animation with duration 0`);
        }
        this.targetContainer = data.targetContainer;
        this.targetIndex = data.targetIndex;
    }
    removeSubjectFromContainer() {
        let elements = this.subjectContainer.children;
        let index = elements.indexOf(this.subject);
        if (index != -1) {
            elements.splice(index, 1);
        }
    }
    start(time) {
        super.start(time);
        this.removeSubjectFromContainer();
        this.startPos = this.subject.latestPosition;
        this.endPos = this.targetContainer.calculateChildPosition(this.targetIndex, this.skin);
    }
    complete() {
        this.removeSubjectFromContainer();
        this.targetContainer.children.splice(this.targetIndex, 0, this.subject);
        super.complete();
    }
    drawProgress(progress) {
        this.subject.draw(this.skin, new NewPos((this.endPos.x - this.startPos.x) * progress + this.startPos.x, (this.endPos.y - this.startPos.y) * progress + this.startPos.y));
    }
}
