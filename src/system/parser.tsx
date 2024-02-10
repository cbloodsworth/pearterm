import { CommandName, command_map } from './commands'

const isFlag = (raw_token: string) => {
    return raw_token.length >= 2 && raw_token[0] === '-';
}

export class Lexer {
    raw_tokens: string[];
    tokens: Token[];
    current: number;

    constructor(raw_content: string) {
        this.raw_tokens = raw_content.trim().split(' ');
        this.tokens = [];
        this.current = 0;
    }


    next(): Token {
        if (this.current >= this.raw_tokens.length) {
            return { kind: TokenKind.EOF, content: 'EOF' };
        }

        const token = this.raw_tokens[this.current++];

        if (token in CommandName) {
            return { kind: TokenKind.COMMAND, content: token };
        }
        else if (isFlag(token)) {
            return { kind: TokenKind.FLAG, content: token };
        }
        else {
            return { kind: TokenKind.PARAMETER, content: token };
        }
    }

    lex(): Token[] {
        while (true) {
            const curr = this.next();
            this.tokens.push(curr);

            if (curr.kind == TokenKind.EOF) { break; }
        }
        return this.tokens;
    }
}

export class Parser {
    EOF = { kind: TokenKind.EOF, content: 'EOF' }
    tokens: Token[];
    current: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }

    err(token: Token, expected: TokenKind) {
        return `Syntax error at ${token}, expected ${expected}`
    }

    prev(): Token {
        if (this.current <= 0) {
            console.log("Attempted to get previous token, when such a token didn't exist.")
            return this.tokens[0]
        }
        return this.tokens[this.current - 1]
    }

    peek(): Token {
        if (this.current >= this.tokens.length) return this.EOF;
        return this.tokens[this.current + 1]
    }

    match(kind: TokenKind) {
        // checks if the token is of the expected kind
        if (kind != this.tokens[this.current].kind) return false;

        this.current++;

        return true;
    }

    /* We want any command to be in the format <command> [flags] [parameter] */
    validate(): boolean {
        /** Verifying command */
        if (!this.match(TokenKind.COMMAND)) return false;

        let template = command_map.get(this.tokens[0].content);
        if (template == undefined) return false;

        /** Verifying flags */
        while (this.match(TokenKind.FLAG)) {
            let flag: string = this.prev().content;
            if (!isFlag(flag)) return false;  // can never be too safe

            // Note that this is string matching, not match in the context of parsing.
            // We are matching flag with a regex string of allowed flags (ex. "mn" allows -m and -n)
            if (!flag.match(template.allowed_flags)) { return false; }
        }

        /** Verifying parameters */
        let param_count = 0
        while (this.match(TokenKind.PARAMETER)) { 
            param_count++; 
        }
        if (!(param_count in template.params_expected)) {
            return false;
        }

        /** Verifying end of file as we expect */
        return this.match(TokenKind.EOF);
    }
}

export interface Token {
    kind: TokenKind;
    content: string;
}

export enum TokenKind {
    COMMAND,
    FLAG,
    PARAMETER,
    EOF
}
