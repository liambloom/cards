// import { v4 as uuid } from "../../node_modules/uuid/dist/index.js";
import { GameAnimation } from "../client/animation.js";
import { NewPos, PositionTree } from "./display.js";

export function register(item: PositionTree<any>): void {

}

export class Player {
    public readonly playerId: string = "";//uuid();

    public constructor() {

    }
}

export class Action {

    public constructor(
        public readonly animation: GameAnimation,
        public readonly subject: PositionTree<any>,
        public readonly targetContainer: PositionTree<any>,
        public readonly targetIndex: number,
        public readonly source?: Player
    ) {

    }

    public complete() {
        this.targetContainer.children.splice(this.targetIndex, 0, this.subject);
    }
}