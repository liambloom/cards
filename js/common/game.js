import { Parent } from "./display.js";
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
    constructor(animation, subjectContainer, subject, targetContainer, targetIndex, source) {
        this.animation = animation;
        this.subjectContainer = subjectContainer;
        this.subject = subject;
        this.targetContainer = targetContainer;
        this.targetIndex = targetIndex;
        this.source = source;
        if ((subjectContainer instanceof TheVoid || targetContainer instanceof TheVoid) && animation.duration !== 0) {
            throw new Error(`Attempted to move ${subject} ${subjectContainer instanceof TheVoid ? "from" : "into"}`
                + ` with an animation of duration ${animation.duration}, you must use animation with duration 0`);
        }
    }
    removeSubjectFromContainer() {
        let elements = this.subjectContainer.children;
        let index = elements.indexOf(this.subject);
        if (index != -1) {
            elements.splice(index, 1);
        }
    }
    start(time, endPos) {
        this.removeSubjectFromContainer();
        if (this.animation.duration > 0) {
            this.animation.start(this.subject, time, endPos);
        }
    }
    complete() {
        this.removeSubjectFromContainer();
        this.targetContainer.children.splice(this.targetIndex, 0, this.subject);
    }
}
