import { Command } from "../commands";

export interface Token {
    kind: TokenKind;
    content: string;
}

export enum TokenKind {
    COMMAND,
    FLAG,
    PARAMETER,
    REDIRECT,
    COMMENT,
    EOF
}

export const get_error_command = (error: string): Command => {
    return { name:`Syntax Error: ${error}`, flags: new Set([]), parameters: [] };
}

export const get_empty_command = (): Command => {
    return { name:"", flags: new Set([]), parameters:[] };
}

// This is probably not the best, most robust way to do this....
export const isFlag = (raw_token: string) => {
    return raw_token.length >= 2 && raw_token[0] === '-';
}