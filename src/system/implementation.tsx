import { Command, CommandName } from "../system/commands"
import FileSystemNode from "../system/filetree.tsx"

export const dirColorChar = '\u1242';  // we assume that this won't be input by the user....

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
export const evaluateCommand = (command: Command, pwd: FileSystemNode, setPwd: (dir: FileSystemNode) => void): string => {
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
                if (child.isDirectory) { displayName = dirColorChar+displayName+dirColorChar }

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
                else { setPwd(dir); }
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
        case (CommandName.debug): {
            pwd.addFile("a.txt", "Content!\nContent!\nContent!");
            const debugString = "Added file a.txt";
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
