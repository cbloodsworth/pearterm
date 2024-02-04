import React, { useEffect, useState, useRef } from 'react';

import Prompt from './prompt'

import '../styles/view.css';

interface TerminalProps {
    user: string,
    dir: string,
    changeDir: (label: string) => void;
}


const Terminal: React.FC<TerminalProps> = ({ user, dir, changeDir }) => {
    const getPrompt = (): string => { return `${user}@portfolio: ${dir.toLowerCase().replace(' ', '_')} $ ` }

    const [input, setInput] = useState("");
    const [output, setOutput] = useState<string[]>([getPrompt()]);
    const inputRef = useRef();


    useEffect(() => { inputRef.current.focus(); }, [])

    return (
        <div className='window terminal' onClick={() => { inputRef.current.focus(); }}>
            {output.map((line) => (
                <span>
                    <Prompt prompt={line} />
                </span>
            ))}
            <input
                ref={inputRef}
                type='text'
                value={input}
                className='terminalInput'
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                    switch (event.key) {
                        case "Enter": {
                            let newOutput = "";
                            switch (input) {
                                case "": break;
                                case "ls": newOutput += "[list.directory]main_page  projects  my_links"; break;
                                case "pwd": newOutput += "You're on my terminal site"; break;
                                case "clear": {
                                    setOutput([getPrompt()]);
                                    setInput("");
                                    break;
                                }
                                case "cd projects": {
                                    changeDir('Projects');
                                    dir = 'projects' // TODO: CHANGE GOD THIS IS AWFUL
                                    break;
                                }
                                case "cd main_page": {
                                    changeDir('Main Page');
                                    dir = 'main_page' // TODO: CHANGE GOD THIS IS AWFUL
                                    break;
                                }
                                case "cd my_links": {
                                    changeDir('My Links');
                                    dir = 'my_links' // TODO: CHANGE GOD THIS IS AWFUL
                                    break;
                                }
                                default: newOutput += `Unknown command: ${input}`; break;
                            }
                            // add the user's input to the command history
                            output[output.length - 1] += input;

                            // to prevent overflow
                            if (newOutput === "") {
                                if (output.length >= 20) {
                                    setOutput([
                                        ...output.slice(1),
                                        "\n" + getPrompt()
                                    ])
                                }
                                else {
                                    setOutput([
                                        ...output,
                                        "\n" + getPrompt()
                                    ])
                                }
                            }
                            else {
                                if (output.length >= 20) {
                                    setOutput([
                                        ...output.slice(2),
                                        newOutput,
                                        getPrompt()
                                    ])
                                }
                                else {
                                    setOutput([
                                        ...output,
                                        newOutput,
                                        getPrompt()
                                    ])
                                }
                            }

                            setInput("");
                            break;
                        }
                        case "l": {
                            if (event.ctrlKey) {
                                event.preventDefault();
                                setOutput([getPrompt()]);
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