import { TerminalColors, TerminalEnvironment } from "../components/terminal.tsx";
import { Command, CommandName, CommandTemplate, command_map } from "../system/commands"
import FileSystemNode from "../system/filetree.tsx"
import { ansiToColor, htmlToColor } from "./formatContentParser.tsx";

import { themes } from "../../data/themes.ts"
import { CONSTANTS } from "../../data/constants.ts";


/**
 * Returns formatted command error, given the name and associated error.
 */
const getError = (command: Command, error: string): string => {
    return `Error: ${command.name}: ${error}`;
}

/**
 * Returns a standardized error message about not being able to find a file/directory
 */
const getNoFileError = (command: Command, filename: string): string => {
    return getError(command, `${filename}: No such file or directory`);
}

const getNotFileError = (command: Command, filename: string): string => {
    return getError(command, `${filename} is not a file`);
}

const getNotDirectoryError = (command: Command, filename: string): string => {
    return getError(command, `${filename} is not a directory`);
}

/** 
 * Validates and evaluates command given current context, and returns string output. 
 * Performs some actions alongside returning output -- this could be changing
 *  the filesystem, moving the current directory, etc
 */
export const evaluateCommand = (command: Command, 
                                pwd: FileSystemNode, 
                                setPwd: (dir: FileSystemNode) => void, 
                                currentEnvironment: TerminalEnvironment,
                                modifyEnvironment: (environment: TerminalEnvironment) => void,
                                viewContent: string,
                                setViewContent: (content: string) => void,
                                termColors: TerminalColors,
                                setTermColors: (colors: TerminalColors) => void) => {
    if (command.flags.has("h") || command.flags.has("help")) {
        command.parameters = [command.name];
        command.name = CommandName.help;
    }
    switch (command.name) {
        case (CommandName.ls): {
            // Sort output alphabetically and filter out hidden files if necessary
            const dir = (command.parameters.length === 1)
                ? pwd.getFileSystemNode(command.parameters.at(0)!)
                : pwd;

            if (!dir) { return getNoFileError(command, command.parameters.at(0)!); }
            if (!dir.isDirectory) { return getNotFileError(command, command.parameters.at(0)!)}

            const children = dir.getChildren()
                .sort((a,b) => a.filename.localeCompare(b.filename))
                .filter((child) => child.filename[0] !== '.' || command.flags.has("a") || command.flags.has("A"))

            const filenames = children.map((child) => {
                let displayName = child.filename;

                // If whitespace is anywhere in its name, surround display with quotes
                if (/\s/.test(displayName)) { displayName = "'"+displayName+"'"; }
                
                // This is for coloring logic. (Directories vs files)
                // Don't color if being redirected.
                if (child.isDirectory && !command.redirectTo) { 
                    displayName = termColors.primary.formatted + displayName
                                  + termColors.default.formatted
                }

                return displayName;
            });

            // Scummy workaround until I can figure out how to actually represent "." and ".." in code
            if (command.flags.has("a")) filenames.splice(0, 0,
                termColors.primary.formatted + ".",
                termColors.primary.formatted + ".." + termColors.default.formatted
            );

            // If redirecting, do newlines. Otherwise, optimize for human readability
            const delim = command.redirectTo
                ? "\n"
                : "  "
            return filenames.join(delim);  // add two spaces inbetween
        }
        case (CommandName.pwd): { return pwd.getFilepath(); }
        case (CommandName.cd): {
            // If no parameters, go to root
            if (command.parameters.length == 0) { 
                modifyEnvironment({ ...currentEnvironment, dir: pwd.root.filename});
                setPwd(pwd.root); 
            }
            else if (command.parameters.length == 1) {
                const destName = command.parameters[0];
                const dir = pwd.getFileSystemNode(destName);
                if (dir === null) { return getNoFileError(command, destName); }
                else if (!dir.isDirectory) { return getNotDirectoryError(command, destName); }
                else { 
                    modifyEnvironment({ ...currentEnvironment, dir: dir.filename});
                    setPwd(dir); 
                }
            }
            else { return getError(command, `Too many parameters.`) }
            break;
        }
        case (CommandName.cat): {
            if (command.parameters.length == 0) { return getError(command, `No file provided`)}

            let output = "";
            command.parameters.some((filename) => {
                const file = pwd.getFileSystemNode(filename)
                // No such file found
                if (file === null) {
                    output += getNoFileError(command, filename);
                    return output;  // Short circuits and ends the "some" iteration
                }
                // Cannot cat directories
                else if (file.isDirectory) {
                    output += getNotFileError(command, filename);
                    return output;
                }
                // All good
                else { output += file.contents; }
            });

            return output;
        }
        case (CommandName.clear): {
            return CONSTANTS.ESCAPE_CODES.RESET_TERM;
        }
        case (CommandName.touch): {
            const new_filename = command.parameters[0];
            if (new_filename.includes('/')) { return getError(command, `Illegal character used`); }

            pwd.addFile(new_filename);
            break;
        }
        case (CommandName.mkdir): {
            // Get rid of trailing /'s
            const dirname = command.parameters[0].replace(/\/+$/, '');  

            // Cannot use / 
            if (dirname.includes('/')) { return getError(command, `Illegal character used`); }

            // Does this name already exist in this location?
            if (pwd.getChildrenFilenames().includes(dirname)) {
                return getError(command, `Cannot create directory '${command.parameters[0]}': File exists`);
            }
            else {
                pwd.addDirectory(dirname);
                break;
            }
        }
        case (CommandName.rm): {
            if (command.parameters.length != 1) { return getError(command, `Removing multiple items not supported`); }
            const removeName = command.parameters[0];

            let result;
            if (command.flags.has("r")) { result = pwd.removeDirectoryRecursive(removeName); }
            else { result = pwd.removeFile(removeName); }

            if (result.err) return getError(command, result.err);
            break;
        }
        case (CommandName.rmdir): {
            if (command.parameters.length != 1) { return getError(command, `Removing multiple items not supported`); }
            const removeName = command.parameters[0];

            const result = pwd.removeDirectory(removeName);
            if (result.err) return getError(command, result.err);
            
            break;
        }

        case (CommandName.exit): {
            window.close();
            return getError(command, 
                "For browser-based security reasons, this command \n"+
                "does not work (unless you opened this page with a script.)\n"+
                "In the future, when I design a home-page, I'll probably just\n"+
                "have it redirect to there.");
        }

        case (CommandName.echo): {
            return command.parameters.join(" ");  // this might be really naive tbh
        }

        case (CommandName.theme): {
            if (command.flags.has("l") || command.parameters.at(0) === 'list') {
                return Object.keys(themes).toString().replaceAll(',', '\n');
            }

            const themeName = command.parameters.at(0) || "";
            if (themeName === "") return getError(command, `Did not supply theme name. \n(Use theme -l to list available themes.)`)
            const theme = themes[themeName];

            // No such theme exists
            if (theme === undefined) return getError(command, `${themeName}: No such theme`);

            // Is the user just looking for info?
            if (command.flags.has("i")) {
                // Does the theme have info available?
                if (theme.description === undefined) return getError(command, `${themeName}: No info found`);
                // Formatted color swatches
                return theme.description+"\n"+
                        theme.default.formatted+"\u25A0 Default\n"+
                        theme.background.formatted+"\u25A0 Background\n"+
                        theme.primary.formatted+"\u25A0 Primary\n"+
                        theme.mute.formatted+"\u25A0 Mute\n"+
                        theme.info.formatted+"\u25A0 Info\n"+
                        theme.success.formatted+"\u25A0 Success\n"+
                        theme.warning.formatted+"\u25A0 Warning\n"+
                        theme.error.formatted+"\u25A0 Error\n";
            }                 
            setTermColors(theme);

            return "Changed colors!";
        }

        case (CommandName.view): {
            const fileToView = pwd.getFileSystemNode(command.parameters.at(0)!);
            if (fileToView === null) return getError(command, `${command.parameters.at(0)!}: No such file`);
            else {
                if (fileToView.isDirectory) return getError(command, `Cannot view directories (Did you mean ls?)`)
                setViewContent(fileToView.contents || `${fileToView.filename} has no content.`);
            }
            break;
        }

        case (CommandName.help): {
            if (command.parameters.length === 0) {
                const cmdList = Array.from(command_map, ([_, command]) => {return command.info!.usage}).sort().join("\n  ");
                return `pearSH, version ${CONSTANTS.SHELL_VERSION}\n`+
                       `Type 'help NAME' to find out more about the function 'NAME'.\n`+
                       `Alternatively, type 'NAME -h'.\n \n  `+
                       cmdList
            }
            else if (command.parameters.length === 1) {
                const commandTemplate = command_map.get(command.parameters.at(0)!);
                if (commandTemplate === undefined) return getError(command, `${command.parameters.at(0)!}: No such command`);
                else if (commandTemplate.info === undefined) return getError(command, `${command.parameters.at(0)} does exist, but \nhas no documentation yet. (Sorry!)`);
                else return ["usage: "+commandTemplate.info.usage, commandTemplate.info.description.replaceAll("\n", "\n  ")].join("\n  ");
            }
            break;
        }

        case (CommandName.reset): {
            location.reload();
            return "Refreshing the terminal. Have a nice day!";
        }
        case (CommandName.debug): {
            let debugString = termColors.default.formatted+"Default\n"+
                              termColors.primary.formatted+"Primary\n"+
                              termColors.mute.formatted+"Mute\n"+
                              termColors.info.formatted+"Info\n"+
                              termColors.success.formatted+"Success\n"+
                              termColors.warning.formatted+"Warning\n"+
                              termColors.error.formatted+"Error\n";

            console.log(debugString);
            return debugString;
        }
        case (""): { break; }
        default: {
            // Checking for syntax errors. Errored command parses always start with "SyntaxError" and then the reason for error
            if (command.name.startsWith("Syntax Error:")) { return command.name; }
            else { return `Error: ${command.name} is planned to be implemented, but currently is unavailable.`; }
        }
    }
    return "";
}
