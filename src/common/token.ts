import { TokenArea } from "./display";

export abstract class Token {
    private parts: Map<string, TokenPart> = undefined as unknown as Map<string, TokenPart>;

    constructor(parts: Map<string, TokenPart>) {
        this.parts = parts
    }

    getPart(name: string): TokenPart {
        const r = this.parts.get(name);

        if (r === undefined) {
            throw new Error(`TokenPart "${name}" does not exist`);
        }

        return r;
    }
}


export class TokenPart {
    private visibleTo: Set<Player> = new Set();

    properties: Map<TokenProperty, TokenPropertyValue>;

    constructor(properties: Map<TokenProperty, TokenPropertyValue>) {
        this.properties = properties;
    }

    revealTo(...players: Player[]) {
        for (let player of players) {
            this.visibleTo.add(player);
        }
    }

    hideFrom(...players: Player[]) {
        for (let player of players) {
            this.visibleTo.delete(player);
        }
    }

    isVisibleTo(player: Player): boolean {
        return this.visibleTo.has(player);
    }

    visibleToWho(): ReadonlySet<Player> {
        return new Set(this.visibleTo)
    }
}

export interface TokenProperty {
    name: string;
}

export class ClosedTokenProperty implements TokenProperty {
    readonly name: string;
    readonly values: TokenPropertyValue[];

    constructor(name: string, values: TokenPropertyValue[]) {
        this.name = name;
        this.values = values;
    }
}

export class TokenPropertyValue {
    name: string;
    abbr: string;

    constructor(name: string, abbr?: string) {
        this.name = name;
        if (abbr === undefined) {
            abbr = name.charAt(0);
        }
        this.abbr = abbr;
    }
}

export abstract class TokenGroup<T> {
    tokens: T[];

    constructor(tokens: T[]) {
        this.tokens = tokens;
    }
}

export function combinationTokenParts(parts: Map<string, ClosedTokenProperty[]>): Map<string, TokenPart>[] {
    const combinationParts: Map<string, TokenPart[]> = new Map();
    for (let [name, properties] of parts.entries()) {
        combinationParts.set(name, combinationUtil(new Map(), new Map(properties.map(prop => [prop, prop.values]))).map(props => new TokenPart(props)));
    }
    return combinationUtil(new Map(), combinationParts)
}

function combinationUtil<T, U>(done: Map<T, U>, remaining: Map<T, U[]>): Map<T, U>[] {
    if (remaining.size === 0) {
        return [done];
    }

    const r: Map<T, U>[] = [];
    const newRemaining = new Map(remaining);
    const propertyName: T = newRemaining.keys().next().value
    const propertyValues: U[] = newRemaining.get(propertyName) as U[];
    newRemaining.delete(propertyName);

    for (let option of propertyValues) {
        const newDone = new Map(done);
        newDone.set(propertyName, option);
        r.push(...combinationUtil(newDone, newRemaining));
    }

    return r;
}

type Todo = any;

type Player = Todo;