import React, { useEffect, useState, useRef, KeyboardEventHandler } from 'react';

// React components
import Prompt from './prompt'
import BlinkingCursor from './cursor.tsx'
import TerminalContent from './terminalContent.tsx';

// System utilities
import FileSystemNode from '../system/filetree';
import { Validator, Tokenizer } from "../system/parser"
import { Command, CommandName } from "../system/commands"
import { evaluateCommand } from '../system/implementation';
import * as perry from '../system/perry';
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
    customPrompt?: string;
}

const PERRY_PROMPT = {
    NEUTRAL: "('ω') ?> ",
    SUCCESS: "(^▽^) ♪> ",
    FAILURE: "(‵□′) #> ",
};

const NO_OUTPUT: OutputHistoryEntry = { content: '', type: 'no-output' }

const STARTER_LINES: DisplayLine[] = [
    { content: "Welcome to \\e[3;32mpearterm\\e[1;0m! 🍐" },
    { content: "Many Unix/Linux commands are supported."},
    { content: "\\e[3;8mTry `help` for more info." },
]

const Terminal: React.FC<TerminalProps> = ({ user, pwd, setPwd, viewContent, setViewContent }) => {
    // Current terminal metadata
    const [currentEnvironment, modifyEnvironment] = useState<TerminalEnvironment>({
        server: CONSTANTS.SERVER,
        user: user,
        dir: pwd.filename,
    });

    const [termColors, setTermColors] = useState<TerminalColors>(themes[CONSTANTS.DEFAULT_THEME]);

    // For storing what the user is actively typing.
    const [input, setInput] = useState("");
    const [cursorPos, setCursorPos] = useState(0);

    // The useEffect ensures the input box in the terminal is always focused.
    const inputBoxRef = useRef<HTMLInputElement>(null);
    useEffect(() => { inputBoxRef.current && inputBoxRef.current.focus(); }, []);

    // Storing previously entered commands and their results.
    const [history, modifyHistory] = useState<string[][]>([[]]);

    // For up and down arrow key functionality (fetching previously entered commands)
    const historyIndex = useRef(-1);

    // Storage for lines as they are displayed in the terminal.
    const [displayHistory, modifyDisplayHistory] = useState<DisplayLine[]>(STARTER_LINES);

    // When set, the terminal is acting as a sub-REPL (e.g. perry's REPL) and
    // routes input lines to that interpreter instead of the shell.
    const [subRepl, setSubRepl] = useState<'perry' | null>(null);
    const [perryPrompt, setPerryPrompt] = useState<string>(PERRY_PROMPT.NEUTRAL);

    // Clears the terminal from buildup of command history.
    const clearTerminal = () => { 
        modifyDisplayHistory([]); 
    }

    const addHistoryLine =
    (rawInput: string) => {
        modifyHistory(prev => [[...prev[0], rawInput], ...prev.slice(1)])
    }

    const pushHistoryStack = () => {
        modifyHistory([[], ...history])
    }

    const popHistoryStack = () => {
        modifyHistory([...history.slice(1)])
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
        return 23; 
    }

    /** Append display lines, trimming the buffer if needed. Uses functional
     *  setter so async callers see a fresh history each time. */
    const appendDisplayLines = (lines: DisplayLine[]) => {
        const max = getMaxDisplayLines();
        modifyDisplayHistory((prev) => {
            const next = [...prev, ...lines];
            const cutoff = Math.max(0, next.length - max);
            return next.slice(cutoff);
        });
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

        appendDisplayLines(addition);
    }

    /** Splits a result string into output DisplayLines, dropping empty lines. */
    const splitOutputLines = (output: string): DisplayLine[] =>
        output.split('\n').filter((c) => c !== '').map((content) => ({ content }));

    /** Run a single line of input through perry's REPL and append the result. */
    const runPerryLine = async (line: string, prompt: string) => {
        appendDisplayLines([{ content: line, customPrompt: prompt }]);
        addHistoryLine(line);
        const result = await perry.evalExpr(line);
        if (result.ok) {
            appendDisplayLines(splitOutputLines(result.value));
            setPerryPrompt(PERRY_PROMPT.SUCCESS);
        } else {
            // Use the same bright-red ANSI as perry's native REPL.
            const errLines = splitOutputLines(`\\e[1;31m❌ ${result.error}\\e[0;0m`);
            appendDisplayLines(errLines);
            setPerryPrompt(PERRY_PROMPT.FAILURE);
        }
    }

    /** Handle the `perry` shell command: -e expression, FILE, or enter REPL. */
    const handlePerryCommand = async (command: Command, rawInput: string, env: TerminalEnvironment) => {
        appendDisplayLines([{ content: rawInput, environment: env }]);

        if (command.flags.has('e')) {
            if (command.parameters.length !== 1) {
                appendDisplayLines(splitOutputLines("Error: perry -e requires an expression"));
                return;
            }
            const result = await perry.evalExpr(command.parameters[0]);
            appendDisplayLines(splitOutputLines(result.ok ? result.value : `Error: perry: ${result.error}`));
            return;
        }

        // Read in the file and execute it.
        if (command.parameters.length === 1) {
            const filename = command.parameters[0];
            const file = pwd.getFileSystemNode(filename);
            if (file === null) { appendDisplayLines(splitOutputLines(`Error: perry: ${filename}: No such file or directory`)); return; }
            if (file.isDirectory) { appendDisplayLines(splitOutputLines(`Error: perry: ${filename} is not a file`)); return; }
            const result = await perry.runFile(file.contents || '');
            appendDisplayLines(splitOutputLines(result.ok ? result.value : `Error: perry: ${result.error}`));
            return;
        }

        // No args: enter REPL mode.
        perry.preload();
        appendDisplayLines(splitOutputLines("Perry REPL.\nType 'exit' to leave."));
        setPerryPrompt(PERRY_PROMPT.NEUTRAL);
        setSubRepl('perry');
        pushHistoryStack();
    }

    const handleKeyDown = (event: { key: any; ctrlKey: any; preventDefault: () => void; }) => {
        switch (event.key) {
            case "Enter": {
                historyIndex.current = -1;
                const submitted = input;
                setInput("");
                setCursorPos(0);

                // Sub-REPL mode: input goes to perry until the user types `exit`.
                if (subRepl === 'perry') {
                    if (submitted === 'exit') {
                        appendDisplayLines([{ content: submitted, customPrompt: perryPrompt }]);
                        appendDisplayLines(splitOutputLines("Goodbye."));
                        setSubRepl(null);
                        popHistoryStack();
                    } else if (submitted.length === 0) {
                        appendDisplayLines([{ content: '', customPrompt: perryPrompt }]);
                    } else {
                        const promptForLine = perryPrompt;
                        runPerryLine(submitted, promptForLine);
                    }
                    break;
                }

                // Parse!
                const command = new Validator(new Tokenizer(submitted).tokenize()).parse();

                // perry command: handled async outside the synchronous evaluateCommand path.
                if (command.name === CommandName.perry) {
                    addHistoryLine(submitted);
                    handlePerryCommand(command, submitted, {...currentEnvironment});
                    break;
                }

                // If input is empty, result is empty string.
                // Otherwise, evaluate the command!
                const result = (submitted.length === 0)
                    ? ""
                    : evaluateCommand(
                        command, pwd, setPwd,
                        currentEnvironment, modifyEnvironment,
                        viewContent, setViewContent,
                        termColors, setTermColors);


                const commandHistoryEntry: CommandHistoryEntry = 
                    { command: command, rawInput: input, environment: {...currentEnvironment} };

                const outputHistoryEntry: OutputHistoryEntry =
                    { content: result, type: submitted.length === 0 ? 'no-output' : 'command-output' };

                // If we're redirecting, write the result to a file
                //   and do some modification to the outputHistory object
                if (command.redirectTo) {
                    const redirectResult = pwd.writeTo(command.redirectTo, result);
                    if (redirectResult.err) { 
                        outputHistoryEntry.content = redirectResult.err;
                        outputHistoryEntry.type = 'error';
                    }
                    else {
                        // If redirecting, don't output result to terminal; just write it to file
                        Object.assign(outputHistoryEntry, NO_OUTPUT)
                    }
                }

                // Add the newest command to the history
                if (submitted.length > 0) addHistoryLine(submitted);
                addToDisplayHistory({
                    inputCommand: commandHistoryEntry,
                    outputResult: outputHistoryEntry
                });

                // If the result contains the RESET_TERM escape sequence, clear the terminal.
                if (result.includes(CONSTANTS.ESCAPE_CODES.RESET_TERM)) { clearTerminal(); }

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
                if (historyIndex.current < history[0].length - 1) {
                    historyIndex.current++;
                    const recalled = history[0][history[0].length - 1 - historyIndex.current];
                    setInput(recalled);
                    setCursorPos(recalled.length);
                }
                break;
            }

            // Set input to next command entered
            case "ArrowDown": {
                event.preventDefault();
                if (historyIndex.current > 0) {
                    historyIndex.current--;
                    const recalled = history[0][history[0].length - 1 - historyIndex.current] || "";
                    setInput(recalled);
                    setCursorPos(recalled.length);
                }

                // No more commands in history
                else if (historyIndex.current === 0) {
                    setInput("");
                    setCursorPos(0);
                    historyIndex.current = -1;
                }
                break;
            }
            default: {
                break;  // I don't exactly know what to do here
            }
        }
    }

    const handleClick = () => {
        const selection = window.getSelection();
        if (!selection?.toString()) {
            inputBoxRef.current && inputBoxRef.current.focus();
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
        setCursorPos(event.target.selectionStart ?? event.target.value.length);
    }

    const handleSelect = (event: React.SyntheticEvent<HTMLInputElement>) => {
        setCursorPos(event.currentTarget.selectionStart ?? 0);
    }

    return (
        <div className='window terminal' 
             style={{
                background: termColors.background.htmlCode,
                color: termColors.default.htmlCode,
                border: `1px solid ${termColors.success.htmlCode}`
             }}
            onClick={handleClick}
        >
            {displayHistory.map((displayLine) => {
                const colors = (!!displayLine.environment || !!displayLine.customPrompt)
                    ? undefined
                    : termColors;
                return (
                    <>
                        {displayLine.environment
                            ? <Prompt environment={displayLine.environment} colors={termColors}/>
                            : displayLine.customPrompt
                                ? <TerminalContent content={displayLine.customPrompt}/>
                                : <></>}
                        <TerminalContent colors={colors} content={displayLine.content} />
                        <div></div>
                    </>
                );
            })}

            {/* Current user prompt. */}
            {subRepl === 'perry'
                ? <TerminalContent content={perryPrompt}/>
                : <Prompt environment={currentEnvironment} colors={termColors}/>}
            <TerminalContent content={input.slice(0, cursorPos)}/>
            <BlinkingCursor/>
            <TerminalContent content={input.slice(cursorPos)}/>
            <input
                type='text'
                value={input}
                size={1}
                ref={inputBoxRef}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
                spellCheck={false}
                className='terminalInput'
            />
        </div >
    );
};

export default Terminal;
