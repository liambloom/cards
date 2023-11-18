export function register(item) {
}
export class Player {
    constructor() {
        this.playerId = ""; //uuid();
    }
}
export class Action {
    constructor(animation, subject, targetContainer, targetIndex, source) {
        this.animation = animation;
        this.subject = subject;
        this.targetContainer = targetContainer;
        this.targetIndex = targetIndex;
        this.source = source;
    }
    complete() {
        this.targetContainer.children.splice(this.targetIndex, 0, this.subject);
    }
}
