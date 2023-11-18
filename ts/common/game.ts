// import { v4 as uuid } from "../../node_modules/uuid/dist/index.js";
import { GameAnimation } from "../client/animation.js";
import { NewPos, Parent, Element, Skin } from "./display.js";

export class Player {
    public readonly playerId: string = "";//uuid();

    public constructor() {

    }
}

export class TheVoid extends Parent<Element> {
    public calculateChildPosition(index: number, skin: Skin): NewPos {
        throw new Error("Elements in the void have no position");
    }
}

export class Action {
    public next?: Action;

    public constructor(
        public readonly animation: GameAnimation,
        public readonly subjectContainer: Parent<any>,
        public readonly subject: Element,
        public readonly targetContainer: Parent<any>,
        public readonly targetIndex: number,
        public readonly source?: Player
    ) {
        if ((subjectContainer instanceof TheVoid || targetContainer instanceof TheVoid) && animation.duration !== 0) {
            throw new Error(`Attempted to move ${subject} ${subjectContainer instanceof TheVoid ? "from" : "into"}`
                + ` with an animation of duration ${animation.duration}, you must use animation with duration 0`);
        }
    }

    private removeSubjectFromContainer() {
        let elements = this.subjectContainer.children;
        let index = elements.indexOf(this.subject);
        if (index != -1) {
            elements.splice(index, 1);
        }
    }

    public start(time: number, endPos: NewPos) {
        this.removeSubjectFromContainer();
        if (this.animation.duration > 0) {
            this.animation.start(this.subject, time, endPos);
        }
    }

    public complete() {
        this.removeSubjectFromContainer();
        this.targetContainer.children.splice(this.targetIndex, 0, this.subject);
    }
}