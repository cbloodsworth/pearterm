import React, { useEffect, useState, useRef } from 'react';

// React components
import Prompt from './prompt'
import BlinkingCursor from './cursor.tsx'
import TerminalContent from './terminalContent.tsx';

// System utilities
import FileSystemNode from '../system/filetree';
import { Validator, Tokenizer } from "../system/parser"
import { Command } from "../system/commands"
import { evaluateCommand } from '../system/implementation';
import { FormattedColor, ansiToColor } from '../system/formatContentParser.tsx';

// Data imports
import { themes } from "../../data/themes"
import { CONSTANTS } from "../../data/constants"

// CSS Styling
import '../styles/view.css';

export interface TerminalColors {
    default: FormattedColor;
    background: FormattedColor;
    primary: FormattedColor;
    mute: FormattedColor;
    info: FormattedColor;
    success: FormattedColor;
    warning: FormattedColor;
    error: FormattedColor;
    lightTheme?: boolean;
    description?: string;
}

export interface TerminalEnvironment {
    server: string;
    user: string;
    dir: string;
}

interface TerminalProps {
    user: string;
    pwd: FileSystemNode;
    setPwd: (dir: FileSystemNode) => void;
    rootFS: FileSystemNode;
    viewContent: string;
    setViewContent: (content: string) => void;
}

interface CommandHistoryEntry {
    command: Command;
    rawInput: string;
    environment: TerminalEnvironment;
}

interface OutputHistoryEntry {
    content: string;
    type: 'command-output' | 'error' | 'system-message' | 'no-output';
}

interface TerminalHistoryEntry {
    inputCommand: CommandHistoryEntry;
    outputResult: OutputHistoryEntry;
}

interface DisplayLine {
    content: string;
    environment?: TerminalEnvironment;
}

const Terminal: React.FC<TerminalProps> = ({ user, pwd, setPwd, viewContent, setViewContent }) => {
    // Current terminal metadata
    const [currentEnvironment, modifyEnvironment] = useState<TerminalEnvironment>({
        server: CONSTANTS.server,
        user: user,
        dir: pwd.filename,
    });

    const [termColors, setTermColors] = useState<TerminalColors>(themes[CONSTANTS.defaultTheme]);

    // For storing what the user is actively typing. 
    const [input, setInput] = useState("");

    // The useEffect ensures the input box in the terminal is always focused.
    const inputBoxRef = useRef();
    useEffect(() => { inputBoxRef.current.focus(); }, []);

    // Storing previously entered commands and their results.
    const [history, modifyHistory] = useState<TerminalHistoryEntry[]>([]);

    // For up and down arrow key functionality (fetching previously entered commands)
    const historyIndex = useRef(-1);

    // Storage for lines as they are displayed in the terminal.
    const [displayHistory, modifyDisplayHistory] = useState<DisplayLine[]>([]);

    // Clears the terminal from buildup of command history.
    // // TODO: This has the unintended side-effect of also clearing up and down arrow history
    const clearTerminal = () => { 
        modifyDisplayHistory([]); 
    }

    /**
     * Returns the maximum number of lines that can be shown at once in the terminal.
     *  This will likely remain at the constant 23, as I don't expect to change
     *  the terminal's font size.
     *
     * In the case that the font size changes, this function can do something
     *  less trivial, like checking page zoom, or something.
     */
    const getMaxDisplayLines = () => {
        return 26; 
    }

    /** Adds a terminal entry to the display history, while trimming if needed. */
    const addToDisplayHistory = (entry: TerminalHistoryEntry) => {
        const addition: DisplayLine[] = [];
        addition.push({content: entry.inputCommand.rawInput, environment: entry.inputCommand.environment});

        const outputLines = entry.outputResult.content
            .split('\n')  // split on newlines
            .filter((content) => (content !== ""))  // don't include blank content
            .map((content) => {return {content: content}; }  // return in a format we expect
        );
        addition.push(...outputLines);

        // Trim cutoff. Prevents the terminal from overflowing.
        const cutoff = Math.max(0, displayHistory.length + addition.length - getMaxDisplayLines());

        modifyDisplayHistory([...displayHistory, ...addition].slice(cutoff));
    }

    return (
        <div className='window terminal' 
             style={{
                background: termColors.background.htmlCode,
                color: termColors.default.htmlCode,
                border: `1px solid ${termColors.success.htmlCode}`
             }}
             onClick={() => { inputBoxRef.current.focus(); }}>
            {displayHistory.map((displayLine) => (
                <>
                    {displayLine.environment ? <Prompt environment={displayLine.environment} colors={termColors}/> : <></> }
                    <TerminalContent content={displayLine.content} formatted={!displayLine.environment}/>
                    <div></div>
                </>
            ))}

            {/* Current user prompt. */}
            <Prompt environment={currentEnvironment} colors={termColors}/>
            <span>{input}</span><BlinkingCursor/>
            <div></div>
            
            <input
                ref={inputBoxRef}
                type='text'
                value={input}
                className='terminalInput'
                onChange={ 
                    event => { setInput(event.target.value); }
                }
                onKeyDown={event => {
                    switch (event.key) {
                        case "Enter": {
                            historyIndex.current = -1;

                            // Parse!
                            const command = new Validator(new Tokenizer(input).tokenize()).parse();

                            // If input is empty, result is empty string.
                            // Otherwise, evaluate the command!
                            const result = (input.length === 0)
                                ? ""
                                : evaluateCommand(
                                    command, pwd, setPwd, 
                                    currentEnvironment, modifyEnvironment, 
                                    viewContent, setViewContent,
                                    termColors, setTermColors);

                            const commandHistoryEntry: CommandHistoryEntry = 
                                { command: command, rawInput: input, environment: {...currentEnvironment} };

                            const outputHistoryEntry: OutputHistoryEntry = 
                                { content: result, type: input.length === 0 ? 'no-output' : 'command-output' };

                            // If we're redirecting, write the result to a file
                            //   and do some modification to the outputHistory object
                            if (command.redirectTo) {
                                const redirectResult = pwd.writeTo(command.redirectTo, result);
                                if (redirectResult.err) { 
                                    outputHistoryEntry.content = redirectResult.err;
                                    outputHistoryEntry.type = 'error';
                                }
                                else {
                                    // If redirecting, don't output result to terminal: just write it to file
                                    outputHistoryEntry.content = "";
                                    outputHistoryEntry.type = 'no-output';
                                }
                            }

                            const terminalHistoryEntry = { inputCommand: commandHistoryEntry, outputResult: outputHistoryEntry };

                            // Add the newest command to the history
                            modifyHistory([
                                ...history,
                                terminalHistoryEntry
                            ]);

                            addToDisplayHistory(terminalHistoryEntry);

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

                        case "ArrowLeft":
                        case "ArrowRight": {
                            event.preventDefault();
                            break;
                        }

                        // Set input to previous command entered
                        case "ArrowUp": {
                            event.preventDefault();
                            if (historyIndex.current < history.length - 1) {
                                historyIndex.current++;
                                setInput(history[history.length - 1 - historyIndex.current].inputCommand.rawInput);
                            }
                            break;
                        }

                        // Set input to next command entered
                        case "ArrowDown": {
                            event.preventDefault();
                            if (historyIndex.current > 0) {
                                historyIndex.current--;
                                setInput(history[history.length - 1 - historyIndex.current].inputCommand.rawInput || "");
                            }

                            // No more commands in history
                            else if (historyIndex.current === 0) {
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
