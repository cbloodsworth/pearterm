import React, { useEffect, useState, useRef } from 'react';

import Prompt from './prompt'
import { Validator, Tokenizer, Token, TokenKind } from "../system/parser"
import { Command, CommandName } from "../system/commands"

import '../styles/view.css';

import FileSystemNode from '../system/filetree';

interface TerminalProps {
    user: string;
    pwd: FileSystemNode;
    changeDir: (dir: FileSystemNode) => void;
    rootFS: FileSystemNode;
}

interface Line {
    server: string;
    user: string;
    pwd_str: string;
    content: string;
    output_only?: boolean;
}

const server = 'portfolio';
const dirColorChar = '\u1242';  // we assume that this won't be input by the user....

/**
 * Returns formatted command error, given the name and associated error.
 */
const getError = (command: Command, error: string): string => {
    return `Error: ${command.name}: ${error}`;
}

const Terminal: React.FC<TerminalProps> = ({ user, pwd, changeDir, rootFS }) => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<Line[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);

    const historyIndex = useRef(-1);
    const inputRef = useRef();

    useEffect(() => { inputRef.current.focus(); }, []);

    /** Has side effects. Validates and evaluates command given current context, and returns output. */
    const evaluate_command = (command: Command): string => {
        // Checking for syntax errors. Errored command parses always start with "SyntaxError" and then the reason for error
        if (command.name.startsWith("Syntax Error:")) { return command.name; }

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
                if (command.parameters.length == 0) { changeDir(rootFS); }

                else if (command.parameters.length == 1) {
                    const destName = command.parameters[0];
                    const dir = (destName === "..") ? pwd.getParent() : pwd.getFileSystemNode(destName);

                    if (dir === null) { return getError(command, `No such file or directory`); }
                    else if (!dir.isDirectory) { return getError(command, `${destName} is not a directory`); }
                    else { changeDir(dir); }
                }
                else { return getError(command, `Too many parameters.`) }
                break;
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
                const debugString = pwd.root.filepath  // modify this to print arbitrary output on using "debug"
                return debugString;
            }
            case (""): {
                break;
            }
            default: {
                return `Error: ${command.name} is planned to be implemented, but currently is unavailable.`
            }
        }
        return "";
    }

    return (
        <div className='window terminal' onClick={() => { inputRef.current.focus(); }}>
            {output.map((line) => (
                <>
                    {(line.output_only) 
                        ? <></> 
                        : <Prompt server={server} user={line.user} pwd={line.pwd_str} /> }
                    {line.content.split(dirColorChar).map((l, index) => {
                        return (
                            <span key={index} style={{color: (index % 2 == 1)?"#6262E0":"" }}>
                                {l}
                            </span>
                        );
                    })}
                    <div></div>
                </>
            ))}
            
            <Prompt
                server={server}
                user={user}
                pwd={pwd.filename}
            />
            <input
                ref={inputRef}
                type='text'
                value={input}
                className='terminalInput'
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                    switch (event.key) {
                        case "Enter": {
                            const inputLine: Line = {server, user, pwd_str: pwd.filename, content: input, output_only: false}
                            const newOutput: Line = {server, user, pwd_str: pwd.filename, content: "", output_only: true};

                            historyIndex.current = -1;

                            // If input is empty, result is empty string.
                            const result = (input.length === 0)
                                ? ""
                                : evaluate_command(new Validator(new Tokenizer(input).tokenize()).parse());

                            setCommandHistory([
                                input,
                                ...commandHistory
                            ])
                            newOutput.content += result;

                            setOutput([
                                ...output,
                                inputLine,
                                newOutput
                            ])

                            // bit hacky but i think this is the best way we can do this...
                            if (input === "clear") { setOutput([]); }

                            setInput("");
                            break;
                        }

                        // Most terminals support Ctrl+L for clearing
                        case "l": {
                            if (event.ctrlKey) {
                                event.preventDefault();
                                setOutput([]);
                            }
                            break;
                        }

                        // We eventually want tab completion. God help me
                        case "Tab": {
                            event.preventDefault();
                            // uhhh do something eventually
                            break;
                        }

                        // Set input to previous command entered
                        case "ArrowUp": {
                            event.preventDefault();
                            if (historyIndex.current < commandHistory.length - 1) {
                                historyIndex.current++;
                                setInput(commandHistory[historyIndex.current]);
                            }
                            break;
                        }

                        // Set input to next command entered
                        case "ArrowDown": {
                            event.preventDefault();
                            if (historyIndex.current >= 0) {
                                historyIndex.current--;
                                setInput(commandHistory[historyIndex.current] || "");
                            }

                            // No more commands in history
                            else if (historyIndex.current === -1) {
                                setInput("");
                            }
                            break;
                        }
                        default: {
                            break;  // I don't exactly know what to do here
                        }
                    }
                }}
            />
        </div >
    );
};

export default Terminal;
