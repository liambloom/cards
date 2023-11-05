// import { v4 as uuid } from "../../node_modules/uuid/dist/index.js";
import { GameAnimation } from "../client/animation.js";



export interface GameItem {
    itemId: string
}

export function register(item: GameItem): void {

}

// export class Player implements GameItem {
//     // public readonly itemId: string = uuid();

//     public constructor() {

//     }
// }

// export class Action {
//     animation: GameAnimation;
//     target: GameItem;
//     source?: Player;
//     targetContainer: GameItem;
//     targetIndex: number;

//     public constructor() {

//     }
// }