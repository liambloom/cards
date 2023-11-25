// import { v4 as uuid } from "../../node_modules/uuid/dist/index.js";
import { Card } from "./cards.js";
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

export interface BaseActionData<T extends Element> {
    subject: T;
    subjectContainer: Parent<T>,
    source: Player | null;
    skin: Skin;
    duration: number;
    timeFunction: (time: number) => number;
    next?: Action<Element>;
}

export abstract class Action<T extends Element> implements BaseActionData<T> {
    public next?: Action<Element>;
    public readonly subject: T;
    public readonly subjectContainer: Parent<T>;
    public readonly source: Player | null;
    public readonly skin: Skin;
    public readonly duration: number;
    public readonly timeFunction: (time: number) => number;
    private startTime?: number;

    public constructor(data: BaseActionData<T>) {
        this.subject = data.subject;
        this.subjectContainer = data.subjectContainer;
        this.source = data.source;
        this.skin = data.skin;
        this.duration = data.duration;
        this.timeFunction = data.timeFunction;
        this.next = data.next;
    }

    public get hasStarted(): boolean {
        return this.startTime !== undefined;
    }

    public isCompleted(time: number): boolean {
        return this.startTime !== undefined && this.startTime + this.duration <= time;
    }

    public start(time: number) {
        if (this.hasStarted) {
            throw new Error("Cannot start animation more than once");
        }
        if (this.subjectContainer.children.indexOf(this.subject) === -1) {
            throw new Error("Animation cannot begin because subject has moved");
        }
        this.startTime = time;
    }

    public draw(time: number) {
        if (this.startTime === undefined) {
            throw new Error("Cannot draw animation before it has started");
        }
    
        this.drawProgress(this.timeFunction((time - this.startTime!) / this.duration!));
    }

    public complete(): void {
        if (this.next !== undefined) {
            this.next.start(this.startTime! + this.duration);
        }
    }

    protected abstract drawProgress(progress: number): void;
}

export enum FlipDirection {
    Horizontal,
    Vertical,
}

export class FlipAction extends Action<Card> {
    public readonly direction: FlipDirection;
    private targetFace?: boolean;

    public constructor(data: BaseActionData<Card> & { direction: FlipDirection }) {
        super(data);
        this.direction = data.direction;
    }

    public override start(time: number) {
        console.log(performance.now());
        super.start(time);
        this.targetFace = !this.subject.faceUp;
    }

    public override complete() {
        console.log(performance.now());
        this.subject.faceUp = this.targetFace!;
        super.complete();
    }

    public override drawProgress(progress: number): void {
        const origTransform = this.skin.ctx.getTransform();
        if (progress > .5) {
            this.subject.faceUp = this.targetFace!;
        }

        const scale = Math.abs(Math.cos(progress * Math.PI));
        this.skin.ctx.translate(this.subject!.latestPosition.x, this.subject!.latestPosition.y);
        if (this.direction === FlipDirection.Horizontal) {
            this.skin.ctx.translate(this.skin.cardWidth * (1 - scale) / 2, 0);
            this.skin.ctx.scale(scale, 1);
        }
        else {
            this.skin.ctx.translate(0, this.skin.cardHeight * (1 - scale) / 2);
            this.skin.ctx.scale(1, scale);
        }
        this.skin.ctx.translate(-this.subject!.latestPosition.x, -this.subject!.latestPosition.y);

        this.subject!.draw(this.skin, this.subject.latestPosition);

        this.skin.ctx.setTransform(origTransform);
    }
}

export class MoveAction<T extends Element> extends Action<T> {
    public readonly targetContainer: Parent<T>;
    public readonly targetIndex: number;
    private startPos?: NewPos;
    private endPos?: NewPos;

    public constructor(data: BaseActionData<T> & {
        targetContainer: Parent<T>,
        targetIndex: number,
    }) {
        super(data);
        if ((data.subjectContainer instanceof TheVoid || data.targetContainer instanceof TheVoid) && data.duration !== 0) {
            throw new Error(`Attempted to move ${data.subject} ${data.subjectContainer instanceof TheVoid ? "from" : "into"}`
                + ` with an animation of duration ${data.duration}, you must use animation with duration 0`);
        }
        this.targetContainer = data.targetContainer;
        this.targetIndex = data.targetIndex;
    }

    private removeSubjectFromContainer() {
        let elements = this.subjectContainer.children;
        let index = elements.indexOf(this.subject);
        if (index != -1) {
            elements.splice(index, 1);
        }
    }

    public override start(time: number) {
        super.start(time);
        this.removeSubjectFromContainer();
        this.startPos = this.subject.latestPosition;
        this.endPos = this.targetContainer.calculateChildPosition(this.targetIndex, this.skin);
    }

    public override complete() {
        this.removeSubjectFromContainer();
        this.targetContainer.children.splice(this.targetIndex, 0, this.subject);
        super.complete();
    }

    public override drawProgress(progress: number): void {
        this.subject!.draw(this.skin, new NewPos((this.endPos!.x - this.startPos!.x) * progress + this.startPos!.x,
            (this.endPos!.y - this.startPos!.y) * progress + this.startPos!.y));
    }
}