import { CommandName, Command, command_map } from './commands'


const get_error_command = (error: string): Command => {
    return { name:`Syntax Error: ${error}`, flags:[], parameters: [] }
}

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
        return `Syntax Error at ${token}, expected ${expected}`
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

    private match(kind: TokenKind) {
        // checks if the token is of the expected kind
        if (kind != this.tokens[this.current].kind) return false;

        this.current++;

        return true;
    }

    /* We want any command to be in the format <command> [flags] [parameter] */
    parse(): Command {
        /** Verifying command */
        if (!this.match(TokenKind.COMMAND)) return get_error_command("Unknown command.");

        let cmd_name = this.tokens[0].content;  // Gathered command name here
        let template = command_map.get(cmd_name);
        if (template == undefined) return get_error_command("Unkown command.");

        /** Verifying flags */
        let cmd_flags = []
        while (this.match(TokenKind.FLAG)) {
            let flag: string = this.prev().content;
            if (!isFlag(flag)) return get_error_command("Unexpected flag.");  // can never be too safe

            flag = flag.substring(flag.search(/[a-z]/));

            // Note that this is string matching, not match in the context of parsing.
            // We are matching flag with a regex string of allowed flags (ex. "mn" allows -m and -n)
            if (template.allowed_flags.indexOf(flag) == -1) { 
                return get_error_command("Unexpected flag.");
            }

            cmd_flags.push(flag);  // Gathering command flags here
        }

        /** Verifying parameters */
        let cmd_params = []
        while (this.match(TokenKind.PARAMETER)) { 
            cmd_params.push(this.prev().content)
        }
        if (!(cmd_params.length in template.params_expected)) {
            return get_error_command(`Unexpected number of parameters: ${cmd_params.length}. Expected ${template.params_expected} parameters.`);
        }

        /** Verifying end of file as we expect */
        if (this.match(TokenKind.EOF)) {
            return { name: cmd_name, flags: cmd_flags, parameters: cmd_params };
        }
        else {
            return get_error_command("Unexpected token placement. (Misplaced flag?)");
        }
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
