import { TerminalColors, TerminalEnvironment } from "../components/terminal.tsx";
import { Command, CommandName } from "../system/commands"
import FileSystemNode from "../system/filetree.tsx"
import { ansiToColor, htmlToColor } from "./formatContentParser.tsx";

import { themes } from "../../data/themes.ts"

/**
 * Returns formatted command error, given the name and associated error.
 */
const getError = (command: Command, error: string): string => {
    return `Error: ${command.name}: ${error}`;
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
    switch (command.name) {
        case (CommandName.ls): {
            // Sort output alphabetically and filter out hidden files if necessary
            const children = pwd.getChildren()
                .sort((a,b) => a.filename.localeCompare(b.filename))
                .filter((child) => child.filename[0] !== '.' || command.flags.has("a"))

            const filenames = children.map((child) => {
                let displayName = child.filename;

                // If whitespace is anywhere in its name, surround display with quotes
                if (/\s/.test(displayName)) { displayName = "'"+displayName+"'"; }
                
                // This is for coloring logic. (Directories vs files)
                if (child.isDirectory) { 
                    displayName = termColors.primary.formatted + displayName
                                  + termColors.default.formatted
                }

                return displayName;
            });

            return filenames.join('\u00A0\u00A0');  // add two spaces inbetween
        }
        case (CommandName.pwd): { return pwd.getFilepath(); }
        case (CommandName.cd): {
            // If no parameters, go to root
            if (command.parameters.length == 0) { setPwd(pwd.root); }

            else if (command.parameters.length == 1) {
                const destName = command.parameters[0];
                const dir = (destName === "..") ? pwd.getParent() : pwd.getFileSystemNode(destName);

                if (dir === null) { return getError(command, `No such file or directory`); }
                else if (!dir.isDirectory) { return getError(command, `${destName} is not a directory`); }
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
            command.parameters.forEach((filename) => {
                const file = pwd.getFileSystemNode(filename)

                output += (file)
                    ? `${file.contents}`
                    : `${getError(command, `${filename}: No such file or directory`)}`

                if (!file) { return output; }
            })

            return output;
        }
        case (CommandName.clear): {
            // Implementation for this is currently outside of this function, in the onKeyDown event
            // I couldn't think of a better way to do it ;-;
            break;
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
            break;
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

            if (theme === undefined) return getError(command, `${themeName}: No such theme`);
            else { 
                setTermColors(theme);
            }

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
