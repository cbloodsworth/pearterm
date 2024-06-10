import { CommandName } from "../commands";
import { Scanner } from "./scanner";
import { Token, TokenKind, isFlag } from "./utils";

export class Tokenizer {
    raw_tokens: string[];
    tokens: Token[];
    current: number;

    constructor(raw_content: string) {
        this.raw_tokens = (new Scanner(raw_content)).lex()
        this.tokens = [];
        this.current = 0;
    }

    next(): Token {
        if (this.current >= this.raw_tokens.length) {
            return { kind: TokenKind.EOF, content: 'EOF' };
        }

        const token = this.raw_tokens[this.current++];

        // If this matches a commandname and we're at the first, it's a command
        if (token in CommandName && this.current === 1) { return { kind: TokenKind.COMMAND, content: token }; }

        else if (token.at(0) === '#') { return { kind: TokenKind.COMMENT, content: token}}

        // Otherwise, let's check for flags
        else if (isFlag(token)) { return { kind: TokenKind.FLAG, content: token }; }

        // This is for redirects
        else if (token === ">") { return { kind: TokenKind.REDIRECT, content: token } }

        // We assume anything past this is a parameter.
        else { return { kind: TokenKind.PARAMETER, content: token }; }
    }

    tokenize(): Token[] {
        while (true) {
            const curr = this.next();
            if (curr.kind === TokenKind.COMMENT) { continue; }

            this.tokens.push(curr); 
            if (curr.kind === TokenKind.EOF) { break; }
        }
        return this.tokens;
    }
}