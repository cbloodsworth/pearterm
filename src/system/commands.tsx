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
    theme = 'theme',
    view = 'view',
    help = 'help',
    reset = 'reset',
    debug = 'debug'
}


export interface Command {
    name: string;
    flags: Set<string>;
    parameters: string[];
    redirectTo?: string;
}

interface CommandInformation {
    usage: string;
    description: string;
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
export interface CommandTemplate {
    name: string;
    allowed_flags: string[];
    params_expected: number[];
    info?: CommandInformation;
}

const CMD_LS: CommandTemplate = { name: CommandName.ls, allowed_flags: ["l", "a"], params_expected:[0,1],
    info: { usage: "ls [-la]... [FILE]...",
            description: "List information about the FILEs (the current directory by default).\n"+
                         "\t-a\tdo not ignore entries starting with .\n"+
                         "\t-l\tuse a long listing format" }}
const CMD_PWD: CommandTemplate = { name: CommandName.pwd, allowed_flags: [], params_expected:[0],
    info: { usage: "pwd",
            description: "Print the name of the current working directory." }}
const CMD_CD: CommandTemplate = { name: CommandName.cd, allowed_flags: [], params_expected:[0,1],
    info: { usage: "cd [DIR]",
            description: "Change the current directory to DIR. \n"+
                         "The default DIR is \"/\"."}}
const CMD_CAT: CommandTemplate = { name: CommandName.cat, allowed_flags: [], params_expected: [],
    info: { usage: "cat [FILE]...",
            description: "Concatenate FILE(s) to standard output." }}
const CMD_CLEAR: CommandTemplate = { name: CommandName.clear, allowed_flags: [], params_expected:[0],
    info: { usage: "clear",
            description: "Clear the terminal screen." }}
const CMD_TOUCH: CommandTemplate = { name: CommandName.touch, allowed_flags: [], params_expected:[1],
    info: { usage: "touch [FILE]",
            description: "Create an empty file with name FILE." }}
const CMD_MKDIR: CommandTemplate = { name: CommandName.mkdir, allowed_flags: [], params_expected:[1],
    info: { usage: "mkdir [DIRECTORY]",
            description: "Create a directory with name DIRECTORY." }}
const CMD_RM: CommandTemplate = { name: CommandName.rm, allowed_flags: ["r", "f"], params_expected:[1],
    info: { usage: "rm [-rf]... [FILE]",
            description: "Remove the FILE." }}
const CMD_RMDIR: CommandTemplate = { name: CommandName.rmdir, allowed_flags: ["r", "f"], params_expected:[1],
    info: { usage: "rmdir [DIRECTORY]",
            description: "Remove the DIRECTORY, if it is empty." }}
const CMD_EXIT: CommandTemplate = { name: CommandName.exit, allowed_flags: [], params_expected: [0],
    info: { usage: "exit",
            description: "Exit the shell. Doesn't actually work right now." }}
const CMD_ECHO: CommandTemplate = { name: CommandName.echo, allowed_flags: [], params_expected: [],
    info: { usage: "echo [STRING]...",
            description: "Display a line of text" }}
const CMD_THEME: CommandTemplate = { name: CommandName.theme, allowed_flags: ["l","i"], params_expected: [0,1],
    info: { usage: "theme [-li] [THEME]",
            description: "Set the colortheme to one of a few existing themes.\n"+
                         "`theme list` may be used to list available themes.\n"+
                         "\t-l\tlist available themes\n"+
                         "\t-i\tshow theme information"}}
const CMD_VIEW: CommandTemplate = { name: CommandName.view, allowed_flags: [], params_expected: [1],
    info: { usage: "view [FILE]",
            description: "View the contents of a file in the side-tab.\n"+
                         "Useful for longer files." }}
const CMD_HELP: CommandTemplate = { name: CommandName.help, allowed_flags: [], params_expected: [0,1],
    info: { usage: "help [COMMAND]",
            description: "Display information about builtin commands."}}
const CMD_RESET: CommandTemplate = { name: CommandName.reset, allowed_flags: [], params_expected: [0],
    info: { usage: "reset",
            description: "Reinitialize the terminal (reloads the page.)"}}
const CMD_DEBUG: CommandTemplate = { name: CommandName.debug, allowed_flags: [], params_expected: [],
    info: { usage: "debug",
            description: "Test some kind of variable functionality.\n"+
                         "For developer use only." }}

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
    ["".concat(CommandName.theme), CMD_THEME],
    ["".concat(CommandName.view), CMD_VIEW],
    ["".concat(CommandName.help), CMD_HELP],
    ["".concat(CommandName.reset), CMD_RESET],
    ["".concat(CommandName.debug), CMD_DEBUG],
]);
