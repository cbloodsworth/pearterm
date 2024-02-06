class FileSystemTree {

}

class FileSystemNode {
    parent: FileSystemNode;
    children: FileSystemNode[];

    filename: string;
    isDirectory: boolean;

    constructor(filename: string, isDirectory = false) {
        this.filename = filename;
        this.isDirectory = isDirectory;
    }

    /** Sets filename. Probably used for the mv command, if that ever gets implemented. */
    setFilename(filename: string) {
        filename = filename;
    }

    /** Returns current filename */
    getFilename() {
        return this.filename;
    }

    /** Gets string array output of this node's children */
    getChildrenFilenames() {
        return this.children.map((child) => { child.filename });
    }
}