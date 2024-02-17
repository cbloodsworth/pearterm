class FileSystemNode {
    parent: FileSystemNode | null;
    children: FileSystemNode[];

    filename: string;
    contents: string;
    isDirectory: boolean;

    constructor(parent: FileSystemNode | null, filename: string, isDirectory = false, contents='') {
        this.filename = filename;
        this.contents = contents;
        this.isDirectory = isDirectory;

        this.parent = parent;
        this.children = [];
    }

    /** Sets filename. Probably used for the mv command, if that ever gets implemented. */
    setFilename(filename: string) {
        this.filename = filename;
    }

    /** Returns current filename */
    getFilename() {
        return this.filename;
    }

    /** Gets string array output of this node's children */
    getChildrenFilenames() {
        return this.children.map((child) => child.getFilename())
    }

    getParent() {
        return (this.parent) ? this.parent : this;
    }

    getChildren() {
        return this.children;
    }

    getChild(filename: string): FileSystemNode | undefined {
        return this.children.find((child) => child.getFilename() === filename)
    }

    getSubdirectories() {
        return this.children.filter((child) => child.isDirectory).map((child) => child.getFilename());
    }

    getFiles() {
        return this.children.filter((child) => !child.isDirectory).map((child) => child.getFilename());
    }

    /** Adds a file to the directory's children list, only if it's a directory */
    addFile(filename: string, content='') {
        this.addItem(filename, false, content);
    }

    /** Adds a directory to the directory's children list */
    addDirectory(filename: string) {
        this.addItem(filename, true);
    }

    /** Helper function to abstract out functionality of addDirectory and addFile */
    addItem(filename: string, isDirectory: boolean, content='') {
        if (!this.isDirectory) {
            throw Error('Can only add files to directories');
        }
        this.children.push(new FileSystemNode(this, filename, isDirectory, content))
    }

    /** Removes single file from filesystem */
    removeFile(filename: string) {
        if (this.isDirectory) {
            throw Error('Cannot remove directories');
        }
    }

    /** Recursively removes entire directory and all subcontents */
    removeDirectory(filename: string) {
        const to_remove = this.getChild(filename);
        if (to_remove == undefined) { throw Error('Could not find child with given name.') }
        if (!to_remove.isDirectory) { throw Error('Expected to remove a directory, got a file.'); }

        const remove_index = this.children.indexOf(to_remove);
        this.children.splice(remove_index, 1);
    }

    /** Recursively removes entire directory and all subcontents */
    removeDirectoryRecursive(filename: string) {

    }
}

export default FileSystemNode;