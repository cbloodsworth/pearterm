import { CommandName, Command, command_map } from './commands'


const get_error_command = (error: string): Command => {
    return { name:`Syntax Error: ${error}`, flags: new Set([]), parameters: [] };
}

const get_empty_command = (): Command => {
    return { name:"", flags: new Set([]), parameters:[] };
}

// This is probably not the best, most robust way to do this....
const isFlag = (raw_token: string) => {
    return raw_token.length >= 2 && raw_token[0] === '-';
}

export class Scanner {
    source: string;
    start: number;  // start of current consumption
    current: number;  // index lexer is currently at
    rawTokens: string[];

    constructor(source: string) {
        this.source = source.trim();
        this.start = 0;
        this.current = 0;
        this.rawTokens = [];
    }

    /** Get the character `num` after current, or "" if none exists  */
    get = (num: number) => this.source.charAt(this.current + num);

    /** Check if a character exists `num` after current */
    has = (num: number) => (this.get(num) != "");

    /** Gets the character at current */
    getNext = () => this.get(0);

    /** Check if a character at current */
    hasNext = () => this.has(0);

    /**
     *  Takes the subtring from [start, current) and pushes it to rawTokens.
     *  Sets start = current.
     */
    consume = () => {
        const substr = this.source.substring(this.start, this.current);
        if (substr.length != 0) this.rawTokens.push(substr);
        this.start = this.current;
    }

    /**
     * Shifts the low and high pointer by one, effectively skipping the character.
     */
    forward = () => {
        this.start++;
        this.current++;
    }

    /**
     * Skips until non-whitespace character
     */
    skipSpaces = () => {
        while (this.hasNext() && this.getNext() === ' ') {
            this.forward();
        }
        this.current--;
    }

    lex = (): string[] | null => {
        // Character array for different scope identifiers like ' or "
        while (this.hasNext()) {
            const currentChar = this.getNext();
            switch (currentChar) {
                case ('\''): // Single quote
                case ('"'):  // Double quote
                {
                    this.consume();
                    this.forward();

                    let closedQuote = false;
                    while (this.hasNext()) { 
                        this.current++;
                        if (this.getNext() === currentChar) {
                            this.consume();
                            closedQuote = true;
                            break;
                        }
                    }

                    if (!closedQuote) return null;

                    this.forward();
                    this.skipSpaces();

                    break;
                }
                case ('|'): case ('>'):
                case (' '):  // Split on spaces by default
                {
                    const gatherOp = (currentChar !== ' ')
                    this.consume();

                    if (gatherOp) { 
                        if (currentChar === '>' && this.get(1) === '>') {
                            this.current++;
                        }
                        this.current++;
                        this.consume(); 
                    }

                    this.skipSpaces();

                    break;
                }
            }
            this.current++;
        }

        this.consume();
        console.log(this.rawTokens);
        return this.rawTokens;
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

            flag = flag.substring(flag.search(/[a-zA-Z]/));
            if (flag === 'h' || flag === 'help') {
                return { name: CommandName.help, flags: new Set([]), parameters: [cmd_name]};
            }

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
            return get_error_command(`Unexpected number of arguments: ${cmd_params.length}, `+
                                     `Expected ${template.params_expected.join(" or ")}.`);
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

export const testParserModules = {
    Scanner,
    Tokenizer,
    Validator
}