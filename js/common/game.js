import { NewPos, HoldingParent } from "./display.js";
export const TIME_FUNCTIONS = {
    linear: (n) => n,
};
export class Player {
    constructor() {
        this.playerId = ""; //uuid();
    }
}
export class Action {
    constructor(data) {
        this.latestProgress = 0;
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
        this.drawProgress(Math.max(0, Math.min(1, this.timeFunction((time - this.startTime) / this.duration))));
    }
    complete() {
        if (this.next !== undefined) {
            this.next.start(this.startTime + this.duration);
        }
    }
    removeSubjectFromContainer() {
        let elements = this.subjectContainer.children;
        let index = elements.indexOf(this.subject);
        if (index != -1) {
            elements.splice(index, 1);
        }
        return index;
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
        super.start(time);
        this.targetFace = !this.subject.faceUp;
        this.indexInContainer = this.removeSubjectFromContainer();
    }
    complete() {
        if (this.hasStarted) {
            this.subjectContainer.children.splice(this.indexInContainer, 0, this.subject);
        }
        else {
            this.targetFace = !this.subject.faceUp;
        }
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
        this.subject.draw(this.skin, this.subjectContainer.getChildPosition(this.indexInContainer, this.skin));
        this.skin.ctx.setTransform(origTransform);
    }
}
// export class HoldAction<T extends Element> extends Action<T> {
//     public override start(time: number) {
//         super.start(time);
//         let elements = this.subjectContainer.children;
//         this.removeSubjectFromContainer();
//     }
//     public override complete() {
//         this.removeSubjectFromContainer();
//         super.complete();
//     }
//     protected override drawProgress(progress: number): void {
//         this.subject!.draw(this.skin, this.subject!.latestPosition);
//     }
// }
export class MoveAction extends Action {
    constructor(data) {
        var _a;
        var _b;
        super(((_a = (_b = data).duration) !== null && _a !== void 0 ? _a : (_b.duration = NaN), data));
        this.targetContainer = data.targetContainer;
        this.targetIndex = data.targetIndex;
        this.speed = data.speed;
    }
    start(time) {
        super.start(time);
        this.removeSubjectFromContainer();
    }
    isCompleted(time) {
        return !isNaN(this.duration) && super.isCompleted(time);
    }
    complete() {
        this.removeSubjectFromContainer();
        this.targetContainer.children.splice(this.targetIndex, 0, this.subject);
        super.complete();
    }
    draw(time) {
        if (this.startPos === undefined) {
            this.startPos = this.subject.latestPosition;
            this.endPos = this.targetContainer.calculateChildPosition(this.targetIndex, this.skin);
            if (this.speed !== undefined) {
                let duration = Math.sqrt(Math.pow(this.endPos.x - this.startPos.x, 2) + Math.pow(this.endPos.y - this.startPos.y, 2)) / this.speed;
                if (!isNaN(this.duration) && this.duration !== duration) {
                    throw new Error("Duration and speed were both defined, but mismatch");
                }
                else {
                    this.duration = duration;
                }
            }
        }
        super.draw(time);
    }
    drawProgress(progress) {
        this.subject.draw(this.skin, new NewPos((this.endPos.x - this.startPos.x) * progress + this.startPos.x, (this.endPos.y - this.startPos.y) * progress + this.startPos.y));
    }
    static holdingBufferAction(data) {
        return new MoveAction(Object.assign(Object.assign({}, data), { targetContainer: new HoldingParent(data.subject), targetIndex: 0, timeFunction: TIME_FUNCTIONS.linear, duration: 1e-5 }));
    }
}
