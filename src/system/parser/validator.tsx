import { Command, CommandName, command_map } from "../commands";
import { Token, TokenKind, get_empty_command, get_error_command, isFlag } from "./utils";

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