/** Commands, used as the start of the input string */
export enum CommandName {
    ls = 'ls',
    pwd = 'pwd',
    cd = 'cd',
    clear = 'clear'
}

/** Interface for a command for validation purposes.
 *  @param name: CommandName
 *      Command name. Uses CommandName interface.
 * 
 *  @param allowed_flags: string[]
 *      String listing the characters that can be used as flags.
 *      Examples:
            ["l"]  ==> you can use flag -l
 *          ["m","n"] ==> you can use flags -m, or -n
 *          ""   ==> no flags supported
 *  @param params_expected: number[]
 *      Number of parameters allowed.
 *      Examples:
 *          []: Any number of parameters allowed
 *          [0]: 0 parameters allowed
 *          [0,1]: 0 or 1 parameters allowed
 *          [0,4]: 0 *or* 4 parameters allowed (note: this is not a range!)
 */

export interface Command {
    name: string;
    flags: string[];
    parameters: string[];
}

interface CommandTemplate {
    name: string;
    allowed_flags: string[];
    params_expected: number[];
}

const CMD_LS: CommandTemplate = { name: CommandName.ls, allowed_flags: ["l", "a"], params_expected:[0] }
const CMD_PWD: CommandTemplate = { name: CommandName.pwd, allowed_flags: [], params_expected:[0] }
const CMD_CD: CommandTemplate = { name: CommandName.pwd, allowed_flags: [], params_expected:[0,1] }
const CMD_CLEAR: CommandTemplate = { name: CommandName.pwd, allowed_flags: [], params_expected:[0] }

export const command_map = new Map([
    ["".concat(CommandName.ls), CMD_LS],
    ["".concat(CommandName.pwd), CMD_PWD],
    ["".concat(CommandName.cd), CMD_CD],
    ["".concat(CommandName.clear), CMD_CLEAR],
])