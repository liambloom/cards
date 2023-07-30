export abstract class Token {
    private parts: Map<string, TokenPart> = undefined as unknown as Map<string, TokenPart>;

    constructor() {
    }

    getPart(name: string): TokenPart {
        const r = this.parts.get(name);

        if (r === undefined) {
            throw new Error(`TokenPart "${name}" does not exist`);
        }

        return r;
    }

    initTokenData(parts: Map<string, TokenPart>) {
        this.parts = parts
    }
}

export class Card extends Token {
    constructor() {
        super();
    }

    toString(): string {
        const front = this.getPart("front");
        return front.properties.get(FRENCH_SUITS) as string + front.properties.get(STD_INDICES_EN) as string;
    }
}

export class TokenPart {
    visibility: Todo;

    properties: Map<TokenProperty, string>;

    constructor(properties: Map<TokenProperty, string>) {
        this.properties = properties;
    }
}

export interface TokenProperty {
    name: string;
}

export class ClosedTokenProperty implements TokenProperty {
    readonly name: string;
    readonly values: string[];

    constructor(name: string, values: string[]) {
        this.name = name;
        this.values = values;
    }
}

export class TokenGroup {
    tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }
}

export function combinationTokenGroup(tokenFactory: () => Token, parts: Map<string, ClosedTokenProperty[]>): TokenGroup {
    const combinationParts: Map<string, TokenPart[]> = new Map();
    for (let [name, properties] of parts.entries()) {
        combinationParts.set(name, combinationUtil(new Map(), new Map(properties.map(prop => [prop, prop.values]))).map(props => new TokenPart(props)));
    }
    const tokens: Token[] = combinationUtil(new Map(), combinationParts)
        .map(tokenParts => {
            const token: Token = tokenFactory();
            token.initTokenData(tokenParts);
            return token;
        });

    return new TokenGroup(tokens);
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

export const FRENCH_SUITS: ClosedTokenProperty = new ClosedTokenProperty("suit", [0, 1, 2, 3].map(n => String.fromCharCode(0x2660 + n)));
export const STD_INDICES_EN: ClosedTokenProperty = new ClosedTokenProperty("value", ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"].map(v => v.toString()));

console.log(combinationTokenGroup(() => new Card(), new Map([["front", [FRENCH_SUITS, STD_INDICES_EN]]])).tokens.length);