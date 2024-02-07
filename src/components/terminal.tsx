import React, { useEffect, useState, useRef } from 'react';

import Prompt from './prompt'

import '../styles/view.css';

interface TerminalProps {
    user: string,
    pwd: string,
    changeDir: (label: string) => void;
}

interface HistoryLine {
    server: string;
    user: string;
    pwd: string;
    content: string;
}

const server = 'portfolio'

const Terminal: React.FC<TerminalProps> = ({ user, pwd, changeDir }) => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<HistoryLine[]>([]);
    const inputRef = useRef();

    useEffect(() => { inputRef.current.focus(); }, [])

    return (
        <div className='window terminal' onClick={() => { inputRef.current.focus(); }}>
            {output.map((line) => (
                <>
                    <Prompt server={server} user={line.user} pwd={line.pwd} />
                    <span>{line.content}</span>
                </>
                ))}
            
            <Prompt
                server={server}
                user={user}
                pwd={pwd}
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
                                    pwd = 'projects' // TODO: CHANGE GOD THIS IS AWFUL
                                    break;
                                }
                                case "cd main_page": {
                                    changeDir('Main Page');
                                    pwd = 'main_page' // TODO: CHANGE GOD THIS IS AWFUL
                                    break;
                                }
                                case "cd my_links": {
                                    changeDir('My Links');
                                    pwd = 'my_links' // TODO: CHANGE GOD THIS IS AWFUL
                                    break;
                                }
                                default: newOutput += `Unknown command: ${input}`; break;
                            }
                            // add the user's input to the command history
                            output[output.length - 1] += input;

                            if (newOutput === "") {
                                setOutput([
                                    ...output,
                                    "\n" + getPrompt()
                                ])
                            }
                            else {
                                setOutput([
                                    ...output,
                                    newOutput,
                                    getPrompt()
                                ])
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