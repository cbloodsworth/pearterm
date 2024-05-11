/** Commands, used as the start of the input string */
export enum CommandName {
    ls = 'ls',
    pwd = 'pwd',
    cd = 'cd',
    cat = 'cat',
    clear = 'clear',
    touch = 'touch',
    mkdir = 'mkdir',
    rm = 'rm',
    rmdir = 'rmdir',
    exit = 'exit',
    echo = 'echo',
    debug = 'debug'
}


export interface Command {
    name: string;
    flags: Set<string>;
    parameters: string[];
    redirectTo?: string;
}

/** Interface for a command for validation purposes.
 *  @param name: CommandName
 *      Command name. Uses CommandName interface.
 * 
 *  @param allowed_flags: string[]
 *      String listing the characters that can be used as flags.
 *      Examples:
            ["l"]  ==> you can use flag -l
 *          ["m","n"] ==> you can use flags -m, and/or -n 
 *          ""   ==> no flags supported
 *  @param params_expected: number[]
 *      Number of parameters allowed.
 *      Examples:
 *          []: Any number of parameters allowed
 *          [0]: 0 parameters allowed
 *          [0,1]: 0 or 1 parameters allowed
 *          [0,4]: 0 *or* 4 parameters allowed (note: this is not a range!)
 */
interface CommandTemplate {
    name: string;
    allowed_flags: string[];
    params_expected: number[];
}

const CMD_LS: CommandTemplate = { name: CommandName.ls, allowed_flags: ["l", "a"], params_expected:[0] }
const CMD_PWD: CommandTemplate = { name: CommandName.pwd, allowed_flags: [], params_expected:[0] }
const CMD_CD: CommandTemplate = { name: CommandName.cd, allowed_flags: [], params_expected:[0,1] }
const CMD_CAT: CommandTemplate = { name: CommandName.cat, allowed_flags: [], params_expected: []}
const CMD_CLEAR: CommandTemplate = { name: CommandName.clear, allowed_flags: [], params_expected:[0] }
const CMD_TOUCH: CommandTemplate = { name: CommandName.touch, allowed_flags: [], params_expected:[1] }
const CMD_MKDIR: CommandTemplate = { name: CommandName.mkdir, allowed_flags: [], params_expected:[1] }
const CMD_RM: CommandTemplate = { name: CommandName.rm, allowed_flags: ["r", "f"], params_expected:[1] }
const CMD_RMDIR: CommandTemplate = { name: CommandName.rmdir, allowed_flags: ["r", "f"], params_expected:[1] }
const CMD_EXIT: CommandTemplate = { name: CommandName.exit, allowed_flags: [], params_expected: [0]}
const CMD_ECHO: CommandTemplate = { name: CommandName.echo, allowed_flags: [], params_expected: []}
const CMD_DEBUG: CommandTemplate = { name: CommandName.debug, allowed_flags: [], params_expected: []}

export const command_map = new Map([
    ["".concat(CommandName.ls), CMD_LS],
    ["".concat(CommandName.pwd), CMD_PWD],
    ["".concat(CommandName.cd), CMD_CD],
    ["".concat(CommandName.cat), CMD_CAT],
    ["".concat(CommandName.clear), CMD_CLEAR],
    ["".concat(CommandName.touch), CMD_TOUCH],
    ["".concat(CommandName.mkdir), CMD_MKDIR],
    ["".concat(CommandName.rm), CMD_RM],
    ["".concat(CommandName.rmdir), CMD_RMDIR],
    ["".concat(CommandName.exit), CMD_EXIT],
    ["".concat(CommandName.echo), CMD_ECHO],
    ["".concat(CommandName.debug), CMD_DEBUG],
]);
