import React, { useEffect, useState, useRef } from 'react';

import Prompt from './prompt'
import BlinkingCursor from './cursor.tsx'
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

const Terminal: React.FC<TerminalProps> = ({ user, pwd, setPwd }) => {
    const historyIndex = useRef(-1);
    const inputRef = useRef();

    useEffect(() => { inputRef.current.focus(); }, []);

    const getBasicLine = (): Line => { return {server, user, pwd_str: pwd.filename, content: "", output_only: false}; }

    const [input, setInput] = useState("");
    const [output, setOutput] = useState<Line[]>([getBasicLine()]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [cursorIndex, setCursorIndex] = useState<number>(0);
    const clearTerminal = () => { 
        setInput("");
        setOutput([getBasicLine()]); 
    }

    const updateInputField = (value: string) => {
        output[output.length - 1].content = value;
        setOutput([...output]);
    }

    return (
        <div className='window terminal' onClick={() => { inputRef.current.focus(); }}>
            {output.map((line, index) => (
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
                    {index==output.length-1 ? <BlinkingCursor/> : <></>}
                    <div></div>
                </>
            ))}
            
            <input
                ref={inputRef}
                type='text'
                value={input}
                className='terminalInput'
                onChange={ 
                    event => {
                        setInput(event.target.value);
                        updateInputField(event.target.value);
                    }
                }
                onKeyDown={event => {
                    switch (event.key) {
                        case "Enter": {
                            const inputLine: Line = {...getBasicLine(), content: input};
                            const newOutput: Line = {...getBasicLine(), content: "", output_only: true}
                            //{server, user, pwd_str: pwd.filename, content: "", output_only: true};

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

                            // If we're redirecting, write the result to a file
                            if (command.redirectTo) {
                                const redirectResult = pwd.writeTo(command.redirectTo, result);
                                if (redirectResult.err) { newOutput.content += redirectResult.err; }
                            }
                            else {
                                newOutput.content += result;
                            }

                            setOutput([
                                ...output,
                                newOutput,
                                getBasicLine()
                            ])

                            // bit hacky but i think this is the best way we can do this...
                            if (input === "clear") { clearTerminal(); }

                            setInput("");
                            break;
                        }

                        // Most terminals support Ctrl+L for clearing
                        case "l": {
                            if (event.ctrlKey) {
                                event.preventDefault();
                                clearTerminal();
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
                            console.log(historyIndex.current)
                            if (historyIndex.current < commandHistory.length - 1) {
                                historyIndex.current++;
                                setInput(commandHistory[historyIndex.current]);
                                updateInputField(commandHistory[historyIndex.current]);
                            }
                            break;
                        }

                        // Set input to next command entered
                        case "ArrowDown": {
                            event.preventDefault();
                            console.log(historyIndex.current)
                            if (historyIndex.current >= 0) {
                                historyIndex.current--;
                                setInput(commandHistory[historyIndex.current] || "");
                                updateInputField(commandHistory[historyIndex.current] || "");
                            }

                            // No more commands in history
                            else if (historyIndex.current === -1) {
                                setInput("");
                                updateInputField("");
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
