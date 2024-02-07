class Lexer {
    raw_tokens: string[];

    current: number;

    constructor(raw_content: string) {
        this.raw_tokens = raw_content.split(' ');
        this.current = 0;
    }

    isFlag(raw_token: string) {
        return raw_token.length >= 2 && raw_token[0] === '-';
    }

    next(): Token {
        if (this.current >= this.raw_tokens.length) {
            return { kind: TokenKind.EOF, content: 'EOF' };
        }

        const token = this.raw_tokens[this.current++];

        if (token in CommandName) {
            return { kind: TokenKind.COMMAND, content: token };
        }
        else if (this.isFlag(token)) {
            return { kind: TokenKind.FLAG, content: token };
        }
        else {
            return { kind: TokenKind.PARAMETER, content: token };
        }
    }
}

class Parser {
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
        if (!this.match(TokenKind.COMMAND)) return false;
        while (this.match(TokenKind.FLAG));
        while (this.match(TokenKind.PARAMETER));

        return this.match(TokenKind.EOF);
    }
}

interface Token {
    kind: TokenKind;
    content: string;
}

enum TokenKind {
    COMMAND,
    FLAG,
    PARAMETER,
    EOF
}

/* Commands, used as the start of the input string */
enum CommandName {
    ls = 'ls',
    pwd = 'pwd',
    cd = 'cd',
    clear = 'clear'
}

export default CommandName;