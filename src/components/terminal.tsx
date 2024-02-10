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

const server = 'portfolio'

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

        let command = new Parser(tokens).parse()
        
        // Checking for syntax errors. Errored command parses always start with "SyntaxError"
        if (command.name.startsWith("Syntax Error:")) {
            return command.name;
        }

        switch (command.name) {
            case (CommandName.ls): {
                let filenames = pwd.getChildrenFilenames();
                
                // If we don't have -a flag, we want to get rid of hidden directories
                if (command.flags.indexOf("a") == -1) {
                    filenames = pwd.getChildrenFilenames().filter((filename) => filename[0] != '.');
                }
                
                return filenames.toString();
            }
            case (CommandName.pwd): {

                break;
            }
            case (CommandName.cd): {
                if (command.parameters.length == 0) {
                    changeDir(rootFS);
                }
                break;
            }
            case (CommandName.clear): {

                break;
            }

            default: {

            }
        }
        return "";
    }

    return (
        <div className='window terminal' onClick={() => { inputRef.current.focus(); }}>
            {output.map((line) => (
                <>
                    { (line.output_only) ? <></> : <Prompt server={server} user={line.user} pwd={line.pwd_str} />}
                    <span>{line.content}</span>
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
                            let inputLine: Line = {server, user, pwd_str: pwd.filename, content: input, output_only: false}
                            let newOutput: Line = {server, user, pwd_str: pwd.filename, content: "", output_only: true};

                            let tokens = new Lexer(input).lex();
                            newOutput.content += evaluate_command(tokens);

                            setOutput([
                                ...output,
                                inputLine,
                                newOutput
                            ])
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
                        default: {
                        }
                    }
                }}
            />
        </div >
    );
};

export default Terminal;