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


export class TokenPart {
    visibility: Todo;

    properties: Map<TokenProperty, TokenPropertyValue>;

    constructor(properties: Map<TokenProperty, TokenPropertyValue>) {
        this.properties = properties;
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

export class TokenGroup<T> {
    tokens: T[];

    constructor(tokens: T[]) {
        this.tokens = tokens;
    }
}

export function combinationTokenGroup<T extends Token>(tokenFactory: () => T, parts: Map<string, ClosedTokenProperty[]>): TokenGroup<T> {
    const combinationParts: Map<string, TokenPart[]> = new Map();
    for (let [name, properties] of parts.entries()) {
        combinationParts.set(name, combinationUtil(new Map(), new Map(properties.map(prop => [prop, prop.values]))).map(props => new TokenPart(props)));
    }
    const tokens: T[] = combinationUtil(new Map(), combinationParts)
        .map(tokenParts => {
            const token: T = tokenFactory();
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