class FileSystemNode {
    private root: FileSystemNode;
    private parent: FileSystemNode | null;
    private children: FileSystemNode[];

    public filename: string;  // semantic filename or directory name
    public filepath: string;  // full filepath from root
    public contents: string;
    public isDirectory: boolean; 

    constructor(parent: FileSystemNode | null, filename: string, isDirectory=false, contents='') {
        this.parent = (parent) 
            ? parent 
            : this;
        this.root = (this.parent.root)  // get the root from the parent
            ? this.parent.root
            : this;

        this.filename = filename;
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

    public getFileSystemNode(filename: string): FileSystemNode | undefined {
        return this.getChildFile(filename) || this.getAbsoluteFile(filename);
    }

    private getChildFile(filename: string): FileSystemNode | undefined {
        return this.children.find((child) => child.getFilename() === filename);
    }

    private getAbsoluteFile(filename: string): FileSystemNode | undefined {
        let curr = (filename.charAt(0) === '/')
            ? this.root
            : this

        const path = filename.split('/').filter((value) => value.length > 0);
        for (const file of path) {
            console.log(file);
            const child = curr.getChildFile(file);
            if (child) { curr = child; }
            else { return undefined; }
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
        if (!this.isDirectory) {
            throw Error('Can only add files to directories');
        }
        const result = new FileSystemNode(this, filename, isDirectory, content);
        this.children.push(result)
        return result;
    }

    /**
     * Removes file from current scope.
     * @param filename 
     * @returns 0 if completed, error code if not:
     *          1 if file doesn't exist in current scope
     *          2 if file is a directory
     */
    removeFile(filename: string) {
        const file = this.getFileSystemNode(filename);
        if (file === undefined) { return 1; }
        if (file.isDirectory) { return 2; }

        const remove_index = this.children.indexOf(file);
        this.children.splice(remove_index, 1);

        return 0;
    }

    /**
     * Removes empty director>ies, returns error code if contains content
     * Equivalent to unix's `rm`
     * @param filename 
     * @returns 0 if completed, error code if not:
     *          1 if file doesn't exist in current scope
     *          2 if file is not a directory
     *          3 if directory is not empty
     */
    removeDirectory(filename: string) {
        const file = this.getFileSystemNode(filename);
        if (file == undefined) { return 1; }
        if (!file.isDirectory) { return 2; }
        if (file.getChildren().length != 0) { return 3; }

        const remove_index = this.children.indexOf(file);
        this.children.splice(remove_index, 1);

        return 0;
    }

    /**
     * Removes directory / file recursively. Equivalent to unix's `rm -rf`
     * @param filename 
     * @returns 0 if completed, error code if not:
     *          1 if file doesn't exist in current scope
     */
    removeDirectoryRecursive(filename: string) {
        const to_remove = this.getFileSystemNode(filename);
        if (to_remove === undefined) { return 1; }

        // While remove has children
        while (to_remove.children.length > 0) {
            const child = to_remove.getChildren()[to_remove.children.length - 1];
            const childname = child.getFilename();
            
            to_remove.removeDirectoryRecursive(childname);
        }

        const remove_index = this.children.indexOf(to_remove);
        this.children.splice(remove_index, 1);
        console.log(`Removed ${filename}`);

        return 0;
    }
}

export default FileSystemNode;
