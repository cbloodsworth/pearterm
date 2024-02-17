import React, { useEffect, useState, useRef } from 'react';

import Prompt from './prompt'
import { Parser, Lexer, Token, TokenKind } from "../system/parser"
import { CommandName } from "../system/commands"

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
const dirColorChar = '\u1242';

const Terminal: React.FC<TerminalProps> = ({ user, pwd, changeDir, rootFS }) => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<Line[]>([]);

    const inputRef = useRef();
    useEffect(() => { inputRef.current.focus(); }, []);


    /** Has side effects. Validates and evaluates command given current context, and returns output. */
    const evaluate_command = (tokens: Token[]): string => {
        if (tokens.length == 0) {
            return "";
        }

        const command = new Parser(tokens).parse()
        
        // Checking for syntax errors. Errored command parses always start with "SyntaxError" and then the reason for error
        if (command.name.startsWith("Syntax Error:")) {
            return command.name; 
        }

        switch (command.name) {
            case (CommandName.ls): {
                // This is for coloring logic. (Directories vs files)
                let children = pwd.getChildren().sort((a,b) => 
                    a.getFilename().toLowerCase().localeCompare(b.getFilename().toLowerCase()
                ));
                let filenames = children.map((child) => {
                    if (child.isDirectory) return dirColorChar+child.getFilename()+dirColorChar;
                    else return child.getFilename();
                })

                // If we don't have -a flag, we want to get rid of hidden directories
                if (command.flags.indexOf("a") == -1) {
                    filenames = filenames.filter((filename) => filename[0] != '.');
                }
                
                return filenames.join('\u00A0\u00A0');
            }
            case (CommandName.pwd): { return pwd.getFilename(); }
            case (CommandName.cd): {
                if (command.parameters.length == 0) {
                    changeDir(rootFS);
                }
                else if (command.parameters.length == 1) {
                    const filename = command.parameters[0];

                    const dir = (filename === "..") ? pwd.getParent() : pwd.getChild(filename);
                    if (dir == undefined) {
                        return `Error: ${command.name}: No such file or directory`;
                    }
                    else if (!dir.isDirectory) {
                        return `Error: ${command.name}: ${command.parameters[0]} is not a directory`
                    }
                    else {
                        changeDir(dir);
                    }
                }
                break;
            }
            case (CommandName.clear): {
                // Implementation for this is currently outside of this function, in the onKeyDown event
                // I couldn't think of a better way to do it ;-;
                break;
            }
            case (CommandName.touch): {
                const new_filename = command.parameters[0];
                if (new_filename.includes('/')) {
                    return `Error: ${command.name}: Illegal character used`;
                }
                pwd.addFile(new_filename);
                break;
            }
            case (CommandName.mkdir): {
                const dirname = command.parameters[0];
                let new_dirname = dirname;
                
                while (new_dirname[new_dirname.length - 1] == '/') {
                    new_dirname = new_dirname.substring(0,new_dirname.length - 1);
                }
                
                if (new_dirname.includes('/')) {
                    // Has a '/', but it's not at the end of the name. Illegal.
                    if (new_dirname.indexOf('/') != new_dirname.length - 1) {
                        return `Error: ${command.name}: Illegal character used`;
                    }
                    // Otherwise, we allow it. This allows directory names like mydir/ 
                }
                if (pwd.getChildrenFilenames().includes(new_dirname)) {
                    return `Error: ${command.name}: Cannot create directory '${dirname}': File exists`;
                }
                else {
                    pwd.addDirectory(new_dirname);
                    break;
                }
            }
            case (CommandName.rm): {
                break;
            }
            case (CommandName.exit): {
                window.close();
                break;
            }
            case (CommandName.echo): {
                return command.parameters.join(" ");
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
                    {(line.output_only) ? <></> : <Prompt server={server} user={line.user} pwd={line.pwd_str} />}
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

                            newOutput.content += evaluate_command(new Lexer(input).lex());

                            setOutput([
                                ...output,
                                inputLine,
                                newOutput
                            ])

                            // bit hacky but i think this is the best way we can do this...
                            if (input === "clear") {
                                setOutput([]);
                            }

                            setInput("");
                            break;
                        }
                        case "l": {
                            if (event.ctrlKey) {
                                event.preventDefault();
                                setOutput([]);
                                setInput("");
                            }
                            break;
                        }

                        case "Tab": {
                            event.preventDefault();

                            break;
                        }
                        default: {
                        }
                    }
                }}
            />
        </div >
    );
};

export default Terminal;