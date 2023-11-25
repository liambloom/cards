import { NewPos } from "../common/display.js";
export class GameAnimation {
    /**
     *
     * @param timeFunction A function that takes and input 0-1 and output 0-1, which can be used to control the speed over time
     * @param duration The total time for the animation
     */
    constructor(timeFunction, duration) {
        this.timeFunction = timeFunction;
        this.duration = duration;
        this.started = false;
    }
    start(subject, time, endPos) {
        if (this.started === true) {
            throw new Error("Cannot start animation more than once");
        }
        else {
            this.started = true;
        }
        this.subject = subject;
        this.startTime = time;
        this.startPos = subject.latestPosition;
        console.log(this.startPos);
        this.endPos = endPos;
    }
    isCompleted(time) {
        console.log(`checking completion, startTime: ${this.startTime}, duration: ${this.duration}, time: ${time}`);
        return this.startTime + this.duration <= time;
    }
    draw(skin, time) {
        console.log("animating");
        if (!this.started) {
            throw new Error("Cannot draw animation before it has started");
        }
        const progress = this.timeFunction((time - this.startTime) / this.duration);
        this.subject.draw(skin, new NewPos((this.endPos.x - this.startPos.x) * progress + this.startPos.x, (this.endPos.y - this.startPos.y) * progress + this.startPos.y));
    }
}
