export class LocationPositionRequest {
    constructor(parent, index) {
        this.parent = parent;
        this.index = index;
    }
}
export class ItemPositionRequest {
    constructor(item) {
        this.item = item;
    }
}
export class GameAnimation {
    /**
     *
     * @param timeFunction A function that takes and input 0-1 and output 0-1, which can be used to control the speed over time
     * @param duration The total time for the animation
     */
    constructor(timeFunction, duration) {
        this.timeFunction = timeFunction;
        this.duration = duration;
    }
    start(time) {
        this.startTime = time;
    }
}
