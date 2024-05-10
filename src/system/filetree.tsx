interface FSResult {
    err: string
}

const OK: FSResult = {err: ""};

class FileSystemNode {
    private root: FileSystemNode;
    private parent: FileSystemNode | null;
    private children: FileSystemNode[];

    public filename: string;  // semantic filename or directory name
    public filepath: string;  // absolute filepath from root
    public contents: string;
    public isDirectory: boolean; 

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
        this.children = [];

        // This would be a developer error
        if (this.contents.length > 0 && this.isDirectory) {
            throw Error('Directory cannot have file content.');
        }
    }

    /** Sets filename. Probably used for the mv command, if that ever gets implemented. */
    setFilename(filename: string) {
        this.filename = filename;
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
        return this.children.find((child) => child.getFilename() === filename) || null;
    }

    private getAbsoluteFile(filename: string): FileSystemNode | null {
        let curr = (filename.charAt(0) === '/')
            ? this.root
            : this

        const path = filename.split('/').filter((value) => value.length > 0);
        for (const file of path) {
            console.log(file);
            const child = curr.getChildFile(file);
            if (child) { curr = child; }
            else { return null; }
        }

        return curr;
    }

    getSubdirectories() {
        return this.children.filter((child) => child.isDirectory).map((child) => child.getFilename());
    }

    getFiles() {
        return this.children.filter((child) => !child.isDirectory).map((child) => child.getFilename());
    }

    /** Adds a file to the directory's children list, only if it's a directory */
    addFile(filename: string, content=''): FileSystemNode {
        return this.addItem(filename, false, content);
    }

    /** Adds a directory to the directory's children list */
    addDirectory(filename: string): FileSystemNode {
        return this.addItem(filename, true);
    }

    /** Helper function to abstract out functionality of addDirectory and addFile */
    addItem(filename: string, isDirectory: boolean, content=''): FileSystemNode {
        if (!this.isDirectory) { throw Error('Can only add files to directories'); }
        const result = new FileSystemNode(this, filename, isDirectory, content);
        this.children.push(result)
        return result;
    }

    /**
     * Removes file from current scope.
     * @param filename 
     * @returns FSResult
     */
    removeFile(filename: string): FSResult {
        const file = this.getFileSystemNode(filename);
        if (file === null) { return {err: "File does not exist in current scope"}; }
        if (file.isDirectory) { return {err: "File is a directory"}; }

        const remove_index = this.children.indexOf(file);
        this.children.splice(remove_index, 1);

        return OK;
    }

    /**
     * Removes empty director>ies, returns error code if contains content
     * Equivalent to unix's `rm`
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
     * Removes directory / file recursively. Equivalent to unix's `rm -rf`
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
}

export default FileSystemNode;
