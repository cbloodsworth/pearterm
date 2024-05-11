import React, { useEffect, useState, useRef } from 'react';

import Prompt from './prompt'
import { Validator, Tokenizer, Token, TokenKind } from "../system/parser"
import { Command, CommandName } from "../system/commands"

import '../styles/view.css';

import { evaluateCommand } from '../system/implementation';
import { dirColorChar } from '../system/implementation';

import FileSystemNode from '../system/filetree';

interface TerminalProps {
    user: string;
    pwd: FileSystemNode;
    setPwd: (dir: FileSystemNode) => void;
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

/**
 * Returns formatted command error, given the name and associated error.
 */
const getError = (command: Command, error: string): string => {
    return `Error: ${command.name}: ${error}`;
}

const Terminal: React.FC<TerminalProps> = ({ user, pwd, setPwd }) => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<Line[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);

    const historyIndex = useRef(-1);
    const inputRef = useRef();

    useEffect(() => { inputRef.current.focus(); }, []);

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

                            // Parse!
                            const command = new Validator(new Tokenizer(input).tokenize()).parse();

                            // If input is empty, result is empty string.
                            // Otherwise, evaluate the command!
                            const result = (input.length === 0)
                                ? ""
                                : evaluateCommand(command, pwd, setPwd);

                            setCommandHistory([
                                input,
                                ...commandHistory
                            ])
                            newOutput.content += result;

                            if (command.redirectTo) {
                                pwd.writeTo(command.redirectTo, result);
                            }

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
