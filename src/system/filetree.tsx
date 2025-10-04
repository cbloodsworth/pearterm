import { CONSTANTS } from "../../data/constants";

interface FSResult {
    err: string;
}

type Permission = {
    r: boolean
    w: boolean
    x: boolean
}

const fmtPerm = (p: Permission): string => {
    return `${p.r ? 'r' : '-'}`+
           `${p.w ? 'w' : '-'}`+
           `${p.x ? 'x' : '-'}`;
}

const OK: FSResult = {err: ""};

class FileSystemNode {
    public root: FileSystemNode;
    public parent: FileSystemNode | null;
    public children: FileSystemNode[];

    public filename: string;  // semantic filename or directory name
    public filepath: string;  // absolute filepath from root
    public contents: string;

    public isDirectory: boolean; 
    public ownerPerms: Permission;
    public groupPerms: Permission;
    public globalPerms: Permission;

    public numHardLinks: number;
    public owner: string;
    public group: string;

    public modificationTime: Date;

    constructor(parent: FileSystemNode | null, filename: string, isDirectory=false, contents='') {
        this.parent = parent || this;
        this.root = this.parent.root || this;  // get the root from the parent
        this.filename = filename;

        // If this is root, its filepath and filename are the same
        if (parent === null) {
            this.filepath = this.filename;
        }
        else {
            this.filepath = (parent.filepath.endsWith('/')) 
                ? parent.filepath + this.filename 
                : parent.filepath + "/" + this.filename;
        }

        this.contents = contents;

        this.isDirectory = isDirectory;
        this.ownerPerms = {r: true, w: true, x: isDirectory};
        this.groupPerms = {r: true, w: false, x: isDirectory};
        this.globalPerms = {r: true, w: false, x: isDirectory};

        // TODO: This is not currently accurate but just a placeholder.
        this.numHardLinks = 1;
        this.owner = 'user';
        this.group = 'user';

        this.modificationTime = new Date();

        this.children = [];

        // This would be a developer error
        if (this.contents.length > 0 && this.isDirectory) {
            throw Error('Directory cannot have file content.');
        }
    }

    /** Returns current filename */
    public getFilename() {
        return this.filename;
    }

    /** Returns current filepath */
    public getFilepath() {
        return this.filepath;
    }

    /** Gets string array output of this node's children */
    public getChildrenFilenames() {
        return this.children.map((child) => child.getFilename())
    }

    public getParent() {
        return this.parent;
    }

    public getChildren() {
        return this.children;
    }

    public getContents() {
        return this.contents;
    }

    public getFileSystemNode(filename: string): FileSystemNode | null {
        return this.getChildFile(filename) || this.getAbsoluteFile(filename);
    }

    private getChildFile(filename: string): FileSystemNode | null {
        // Temporary hack until I can figure out how to deal with "." and ".." nodes
        if (filename === '.') return this;
        if (filename === '..') return this.getParent();
        return this.children.find((child) => child.getFilename() === filename) || null;
    }

    // Traverses the tree to find if this file exists, returning it if it does.
    private getAbsoluteFile(filename: string): FileSystemNode | null {
        let curr = (filename.charAt(0) === '/')
            ? this.root
            : this

        const path = filename.split('/').filter((value) => value.length > 0);
        for (const file of path) {
            const child = curr.getChildFile(file);
            if (child) { curr = child; }
            else { return null; }
        }

        return curr;
    }

    getFilePerms(): string {
        let res = "";
        res += this.isDirectory ? 'd' : '-';
        res += fmtPerm(this.ownerPerms);
        res += fmtPerm(this.groupPerms);
        res += fmtPerm(this.globalPerms);

        return res;
    }

    getSubdirectories() {
        return this.children.filter((child) => child.isDirectory).map((child) => child.getFilename());
    }

    getFiles() {
        return this.children.filter((child) => !child.isDirectory).map((child) => child.getFilename());
    }

    /** Adds a file to the directory's children list, only if it's a directory */
    addFile(filename: string, content=''): FileSystemNode | string {
        return this.addItem(filename, false, content);
    }

    /** Adds a directory to the directory's children list */
    addDirectory(filename: string): FileSystemNode | string {
        return this.addItem(filename, true);
    }

    /** Helper function to abstract out functionality of addDirectory and addFile */
    addItem(filepath: string, isDirectory: boolean, content=''): FileSystemNode | string {
        if (filepath.endsWith("/")) filepath = filepath.slice(0, -1);

        const filename = filepath.split("/").slice(-1).join();

        const destination = 
            filepath.includes("/")
                ? this.getFileSystemNode(filepath.split("/")
                          .slice(0, -1)
                          .join("/"))
                : this

        if (!destination) { return CONSTANTS.ERROR_CODES.ENOENT;}
        if (!destination.isDirectory) { return CONSTANTS.ERROR_CODES.ENOTDIR; }

        const result = new FileSystemNode(destination, filename, isDirectory, content);
        destination.children.push(result)
        return result;
    }

    /** Writes content to a file, creating it if it doesn't exist. **/
    writeTo(filename: string, content: string): FSResult {
        const file = this.getFileSystemNode(filename);

        if (!file) { this.addFile(filename, content); }
        else { 
            file.contents = content; 
            this.touchFile();
        }

        return OK;
    }

    /** Touches this file, updating its access time. */
    touchFile(): Date {
        this.modificationTime = new Date();
        return this.modificationTime;
    }

    /**
     * Removes file from current scope.
     * @param filename 
     * @returns FSResult
     */
    removeFile(filename: string): FSResult {
        const file = this.getFileSystemNode(filename);
        if (file === null) { return {err: CONSTANTS.ERROR_CODES.ENOENT}; }
        if (file.isDirectory) { return {err: CONSTANTS.ERROR_CODES.EISDIR}; }

        const remove_index = this.children.indexOf(file);
        this.children.splice(remove_index, 1);

        return OK;
    }

    /**
     * Removes empty directories, returns error code if contains content
     * Equivalent to unix's `rmdir`
     * @param filename 
     * @returns FSResult
     */
    removeDirectory(filename: string): FSResult {
        const file = this.getFileSystemNode(filename);
        if (file === null) { return {err: `Failed to remove '${filename}': No such file or directory`}; }
        if (!file.isDirectory) { return {err: `Failed to remove '${filename}': Not a directory`}; }
        if (file.getChildren().length != 0) { return {err: `Failed to remove '${filename}': Directory not empty`}; }

        const remove_index = this.children.indexOf(file);
        this.children.splice(remove_index, 1);

        return OK;
    }

    /**
     * Removes directory / file recursively. Equivalent to unix's `rm -r`
     * @param filename 
     * @returns FSResult
     */
    removeDirectoryRecursive(filename: string): FSResult {
        const to_remove = this.getFileSystemNode(filename);
        if (to_remove === null) { return {err: `Failed to remove '${filename}': No such file or directory`}; }

        // While remove has children
        while (to_remove.children.length > 0) {
            const child = to_remove.getChildren()[to_remove.children.length - 1];
            const childname = child.getFilename();
            
            to_remove.removeDirectoryRecursive(childname);
        }

        const remove_index = this.children.indexOf(to_remove);
        this.children.splice(remove_index, 1);

        return OK;
    }

    getFmtTime(): string {
        // Get date string but without day of the week
        const dateSplit = this.modificationTime.toDateString().split(' ').slice(1);
        
        // If file was made in the current year, then display it as time instead
        if (parseInt(dateSplit[2]) === new Date().getFullYear()) {
            // Taking this way too far
            dateSplit[2] = new Date().toLocaleTimeString("en-US")
                .split(' ')[0]
                .split(':')
                .slice(0,2)
                .join(':');
        }

        return dateSplit.join(" ");
    }
}

export default FileSystemNode;
