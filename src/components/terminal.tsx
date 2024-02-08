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
    output_only?: boolean;
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
                    { (line.output_only) ? <></> : <Prompt server={server} user={line.user} pwd={line.pwd} />}
                    <span>{line.content}</span>
                    <div></div>
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
                            let newOutput: HistoryLine = {server, user, pwd, content: "", output_only: true};
                            switch (input) {
                                case "": {
                                    break;
                                }
                                case "ls": {
                                    newOutput.content += "[list.directory]main_page  projects  my_links";
                                    break;
                                }
                                case "pwd": {
                                    newOutput.content += pwd; 
                                    break;
                                }
                                case "clear": {
                                    setOutput([]);
                                    setInput("");
                                    break;
                                }
                                case "cd projects": {
                                    changeDir('projects');
                                    break;
                                }
                                case "cd main": {
                                    changeDir('main');
                                    break;
                                }
                                case "cd links": {
                                    changeDir('links');
                                    break;
                                }
                                default: {
                                    newOutput.content += `Unknown command: ${input}`; 
                                    break;
                                }
                            }
                            // add the user's input to the command history
                            setOutput([
                                ...output,
                                {server, user, pwd, content: input, output_only: false},
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