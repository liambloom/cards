import { NewPos, Parent, Skin, Element } from "../common/display.js";

export class GameAnimation {
    private started = false;
    private startTime?: number;
    private subject?: Element;
    private startPos?: NewPos;
    private endPos?: NewPos;

    /**
     * 
     * @param timeFunction A function that takes and input 0-1 and output 0-1, which can be used to control the speed over time
     * @param duration The total time for the animation
     */
    public constructor(
        public readonly timeFunction: (time: number) => number,
        public readonly duration: number,
    ) { }

    public start(subject: Element, time: number, endPos: NewPos) {
        if (this.started === true) {
            throw new Error("Cannot start animation more than once");
        }
        else {
            this.started = true;
        }

        this.subject = subject;
        this.startTime = time;
        this.startPos = subject.latestPosition;
        this.endPos = endPos;
    }

    public isCompleted(time: number): boolean {
        return this.startTime! + this.duration >= time;
    }

    public draw(skin: Skin, time: number) {
        if (!this.started) {
            throw new Error("Cannot draw animation before it has started");
        }

        const progress = this.timeFunction((time - this.startTime!) / this.duration!);
        this.subject!.draw(skin, new NewPos((this.endPos!.x - this.startPos!.x) * progress + this.startPos!.x,
            (this.endPos!.y - this.startPos!.y) * progress + this.startPos!.y));
    }
    // public 
}


