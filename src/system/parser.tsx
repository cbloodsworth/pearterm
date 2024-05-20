import { CommandName, Command, command_map } from './commands'


const get_error_command = (error: string): Command => {
    return { name:`Syntax Error: ${error}`, flags:[], parameters: [] };
}

const get_empty_command = (): Command => {
    return { name:"", flags:[], parameters:[] };
}

// This is probably not the best, most robust way to do this....
const isFlag = (raw_token: string) => {
    return raw_token.length >= 2 && raw_token[0] === '-';
}

export class Scanner {
    source: string;
    start: number;  // start of current consumption
    current: number;  // index lexer is currently at
    raw_tokens: string[];

    constructor(source: string) {
        this.source = source.trim();
        this.start = 0;
        this.current = 0;
        this.raw_tokens = [];
    }

    get = (num: number) => this.source.charAt(this.current + num);
    has = (num: number) => (this.get(num) != "");
    getNext = () => this.get(0);
    hasNext = () => this.has(0);
    advance = () => {
        const substr = this.source.substring(this.start, this.current);
        if (substr.length != 0) this.raw_tokens.push(substr);
        this.current++;
        this.start = this.current;
    }

    lex = (): string[] | undefined => {
        const scope: string[] = [];
        while (this.hasNext()) {
            const curr = this.getNext();
            switch (curr) {
                case ('\''): // Single quote
                case ('"'):  // Double quote
                {
                    scope.push(curr);
                    this.advance();

                    while (this.hasNext()) { 
                        if (this.getNext() === scope[scope.length - 1]) {
                            scope.pop();
                            this.advance();
                            break;
                        }
                        this.current++; 
                    }
                    this.current--;
                    break;
                }
                case (' '):  // Split on spaces by default
                {
                    this.advance();
                    while (this.getNext() === ' ') 
                        { this.current++; }

                    this.current--;

                    break;
                }
            }
            this.current++;
        }
        this.advance();
        console.log(this.raw_tokens)
        return this.raw_tokens;
    }
}

export class Tokenizer {
    raw_tokens: string[];
    tokens: Token[];
    current: number;

    constructor(raw_content: string) {
        this.raw_tokens = (new Scanner(raw_content)).lex();
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
            this.tokens.push(curr);

            if (curr.kind === TokenKind.EOF) { break; }
        }
        return this.tokens;
    }
}

export class Validator {
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

    parse(): Command {
        /** Verifying command */
        if (this.tokens[0].content == "") return get_empty_command();
        if (!this.match(TokenKind.COMMAND)) return get_error_command("Unknown command.");

        const cmd_name = this.tokens[0].content;  // Gathered command name here
        const template = command_map.get(cmd_name);
        if (template == undefined) return get_error_command("Unknown command.");

        /** Verifying flags */
        const cmd_flags: Set<string> = new Set();
        while (this.match(TokenKind.FLAG)) {
            let flag: string = this.prev().content;
            if (!isFlag(flag)) return get_error_command("Unexpected flag.");  // can never be too safe

            flag = flag.substring(flag.search(/[a-z]/));

            // Note that this is string matching, not match in the context of parsing.
            // We are matching flag with a regex string of allowed flags (ex. "mn" allows -m and -n)
            if (!(template.allowed_flags.includes(flag))) {
                return get_error_command("Unexpected flag.");
            }

            cmd_flags.add(flag);  // Gathering command flags here
        }

        /** Verifying parameters */
        const cmd_params = []
        while (this.match(TokenKind.PARAMETER)) { 
            cmd_params.push(this.prev().content)
        }
        if (template.params_expected.length != 0 
            && !(template.params_expected.includes(cmd_params.length))) {
            return get_error_command(`Unexpected number of parameters: ${cmd_params.length}. Expected ${template.params_expected} parameters.`);
        }

        /** Verifying end of file as we expect */
        if (this.match(TokenKind.EOF)) {
            return { name: cmd_name, flags: cmd_flags, parameters: cmd_params };
        }
        // Could be a redirect (example: ls > list.txt)
        else if (this.match(TokenKind.REDIRECT)) {
            // Currently, this will redirect to the first file specified after the redirect symbol
            if (this.match(TokenKind.PARAMETER)) {
                return { name: cmd_name, flags: cmd_flags, parameters: cmd_params, redirectTo: this.prev().content};
            }
            else {
                // I actually don't know if this error message would ever get used.
                return get_error_command("Unexpected token after redirect (expected parameter.)");
            }
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
    REDIRECT,
    EOF
}
