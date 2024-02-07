import CommandName from './parser.tsx'
import React from 'react';

interface Command {
    name: CommandName;
    allowed_flags: string[];
    implementation: (parameters: string) => string;
}

interface CommandProps {
    current_directory: string;

}


const Commands: React.FC<CommandProps> = ({ current_directory }) => {
    const cmd_ls: Command = {
        name: CommandName.ls,
        allowed_flags: [],
        implementation: (parameters: string): string => {

            return ''
        }
    }

    return (
        <>
        </>
    )
}

export default Commands;