import { GameItem } from "../common/game.js";



export class LocationPositionRequest {
    public position?: number;

    public constructor(
        public readonly parent: GameItem,
        public readonly index: number,
    ) {

    }
}

export class ItemPositionRequest {
    public position?: number;

    public constructor(
        public readonly item: GameItem,
    ) {}
}

export class GameAnimation {
    private startTime?: number;

    /**
     * 
     * @param timeFunction A function that takes and input 0-1 and output 0-1, which can be used to control the speed over time
     * @param duration The total time for the animation
     */
    public constructor(
        public readonly timeFunction: (time: number) => number,
        public readonly duration: number,
    ) { }

    public start(time: number) {
        this.startTime = time;
    }

    // public 
}


