import React, { useEffect, useState, useRef } from 'react';

import Prompt from './prompt'

import '../styles/view.css';

import FileSystemNode from '../system/filetree';

interface TerminalProps {
    user: string;
    pwd: FileSystemNode;
    changeDir: (dir: FileSystemNode) => void;
    rootFS: FileSystemNode;
}

interface HistoryLine {
    server: string;
    user: string;
    pwd_str: string;
    content: string;
    output_only?: boolean;
}

const server = 'portfolio'

const Terminal: React.FC<TerminalProps> = ({ user, pwd, changeDir, rootFS }) => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<HistoryLine[]>([]);
    const inputRef = useRef();

    useEffect(() => { inputRef.current.focus(); }, []);

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
                            let newOutput: HistoryLine = {server, user, pwd_str: pwd.filename, content: "", output_only: true};
                            switch (input) {
                                case "": {
                                    break;
                                }
                                case "ls": {
                                    newOutput.content += pwd.getChildrenFilenames();
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
                                case input.match(/^cd[ \r\n]*/)?.input: {
                                    let parsed = input.split(' ');

                                    /** Edge cases */
                                    if (parsed.length > 2 || parsed.length < 1) {
                                        newOutput.content += "Please only provide one directory";
                                        break;
                                    }
                                    /** cd on its own should redirect to root */
                                    if (parsed.length == 1) {
                                        changeDir(rootFS);
                                        break;
                                    }

                                    else {
                                        let dir = parsed[1];
                                        if (dir == "..") {
                                            changeDir(pwd.getParent())
                                            break;
                                        }

                                        let node = rootFS.getChild(dir);
                                        if (node == undefined) {
                                            newOutput.content += "No such directory found";
                                        }
                                        else {
                                            changeDir(node);
                                        }
                                    }

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
                                {server, user, pwd_str: pwd.filename, content: input, output_only: false},
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