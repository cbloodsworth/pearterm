import FileSystemNode from "../src/system/filetree.tsx";

const createRootNode = () => new FileSystemNode(null, '/', true);

test('Root created successfully', () => {
    const root = createRootNode();
    expect(root);
    expect(root.getChildren().length).toBe(0);  // empty children
    expect(root.getParent()).toBe(root);     // root is its own parent. thanks unix
});

test('Add file without content', () => {
    const root = createRootNode();
    root.addFile("a");

    expect(root.getChildren().length).toBe(1);

    const child = root.getChildren()[0];
    expect(child);
    expect(child.getFilename()).toBe("a");
    expect(child.getContents()).toBe("");
});

test('Add file with content', () => {
    const root = createRootNode();
    root.addFile("a", "content");

    expect(root.getChildren().length).toBe(1);

    // Test file creation with content
    const child = root.getChildren()[0];
    expect(child);
    expect(child.getFilename()).toBe("a");
    expect(child.getContents()).toBe("content");
    expect(child.isDirectory).toBe(false);
});

test('Remove file', () => {
    const root = createRootNode();
    root.addFile("a");

    expect(root.getChildren().length).toBe(1);
    root.removeFile("a");
    expect(root.getChildren().length).toBe(0);
});

test('Add directory', () => {
    const root = createRootNode();
    root.addDirectory("dir");
    const directory = root.getChildren()[0];
    expect(root.getChildren().length).toBe(1);
    expect(directory.getFilename()).toBe("dir");
    expect(directory.isDirectory).toBe(true);
});

test('Remove directory', () => {
    const root = createRootNode();
    root.addDirectory("dir");

    expect(root.getChildren().length).toBe(1);
    root.removeDirectory("dir");
    expect(root.getChildren().length).toBe(0);
});

test('Add directory with file', () => {
    const root = createRootNode();
    const dir = root.addDirectory("dir");
    const file = dir.addFile("a.txt");

    expect(dir.getChildren().length).toBe(1);
    expect(file.getParent()).toBe(dir);
    expect(file.getParent().getParent()).toBe(root);
});

test('Remove directory with file', () => {
    const root = createRootNode();
    const dir = root.addDirectory("dir");
    dir.addFile("a.d");
    root.removeDirectoryRecursive("dir");

    expect(root.getChildren().length).toBe(0);
})

test('Remove directory with many files and subdirectories', () => {
    const root = createRootNode();
    const dir = root.addDirectory("dir");
    dir.addFile("a");
    dir.addFile("b");
    dir.addFile("c");
    dir.addDirectory("dir").addDirectory("dir2").addDirectory("dir3").addFile("hellothere.txt", "hello");
    dir.addDirectory("yetAnotherDir").addFile("imheretoo.yaml");

    expect(dir.getChildren().length).toBe(5);
    dir.removeDirectoryRecursive("yetAnotherDir");
    expect(dir.getChildren().length).toBe(4);

    root.removeDirectoryRecursive("dir");
    expect(root.getChildren().length).toBe(0);
    expect(dir.getChildren().length).toBe(0);  // we can still access dir, even though it was deleted...is this ok?
});

test('Remove empty directory', () => {
    const root = createRootNode();
    root.addDirectory("dir");

    expect(root.getChildren().length).toBe(1);
    root.removeDirectory("dir");
    expect(root.getChildren().length).toBe(0);
});

test('Remove directory returns 1 if doesnt exist', () => {
    const root = createRootNode();
    let code = root.removeDirectory("does_not_exist");
    expect(code).toBe(1);

    root.addDirectory("dir");
    code = root.removeDirectory("does_not_exist");
    expect(code).toBe(1);
});

test('Remove directory returns 2 if directory is a file', () => {
    const root = createRootNode();
    const file = root.addFile("file");

    let code = root.removeDirectory("file");
    expect(code).toBe(2);
    expect(root.getChildren().length).toBe(1);
});

test('Remove directory returns 3 if directory has files', () => {
    const root = createRootNode();
    const dir = root.addDirectory("dir");
    dir.addFile("file.txt", "content of some kind");

    let code = root.removeDirectory("dir");
    expect(code).toBe(3);
    expect(root.getChildren().length).toBe(1);
});

test('Remove directory recursive returns 1 if doesnt exist', () => {
    const root = createRootNode();
    let code = root.removeDirectoryRecursive("does_not_exist");
    expect(code).toBe(1);

    root.addDirectory("dir");
    code = root.removeDirectoryRecursive("does_not_exist");
    expect(code).toBe(1);
});

test('Modify filename', () => {
    const root = createRootNode();
    const file = root.addFile("file.txt");

    expect(file.getFilename()).toBe("file.txt");
    file.setFilename("newName.txt");
    expect(file.getFilename()).toBe("newName.txt");
});

test('Get absolute filepath', () => {
    const root = createRootNode();
    const file = root.addDirectory("a").addDirectory("b").addDirectory("c").addFile("file.txt");

    expect(file.getFilepath()).toBe("/a/b/c/file.txt");
});

test('Verify getChildrenFilenames()', () => {
    const root = createRootNode();
    root.addFile("a");
    root.addFile("b");
    root.addFile("c");

    expect(root.getChildrenFilenames().length).toBe(3);
    expect(root.getChildrenFilenames()).toStrictEqual(["a", "b", "c"]);
});

test('Use absolute filepath for retrieval', () => {
    const root = createRootNode();
    const file = root.addDirectory("a").addDirectory("b").addDirectory("c").addFile("file.txt");

    const b = root.getFileSystemNode("/a/b");
    expect(b).not.toBeNull();
    expect(b.getFilename()).toBe("b");
    expect(b.getFilepath()).toBe("/a/b");

    const file2 = b.getFileSystemNode("c/file.txt");
    expect(file).toBe(file2);
});

test('Attempt to add a file to a file', () => {
    const root = createRootNode();
    const file = root.addFile("file.txt");

    expect(() => file.addFile("AddingFileToFile.txt")).toThrow(Error);
});

test('Get only directories', () => {
    const root = createRootNode();
    root.addDirectory("adir");
    root.addDirectory("bdir");
    root.addDirectory("cdir");
    root.addFile("a.md");
    root.addFile("b.md");
    root.addFile("c.md");
    root.addFile("d.md");

    expect(root.getSubdirectories()).toStrictEqual(["adir", "bdir", "cdir"]);
    expect(root.getFiles()).toStrictEqual(["a.md", "b.md", "c.md", "d.md"]);
});

test('Remove file returns 1 if doesnt exist', () => {
    const root = createRootNode();
    let code = root.removeFile("does_not_exist");
    expect(code).toBe(1);

    root.addFile("file.txt");
    code = root.removeFile("does_not_exist");
    expect(code).toBe(1);
});

test('Remove file returns 2 if file is a directory', () => {
    const root = createRootNode();
    const dir = root.addDirectory("dir");

    let code = root.removeFile("dir");
    expect(code).toBe(2);
    expect(root.getChildren().length).toBe(1);
});

test('Verify constructor works as expected', () => {
    // new file with content
    const file1 = new FileSystemNode(null, "newNode.txt", false, "content");
    expect(file1).not.toBeUndefined();
    expect(file1.isDirectory).toBe(false);
    expect(file1.getContents()).toBe("content");

    // new file without content
    const file2 = new FileSystemNode(null, "iDontHaveContent", false);
    expect(file2.getContents()).toBe("");

    // check that it is a file by default
    const file3 = new FileSystemNode(null, "fileByDefault");
    expect(file3.isDirectory).toBe(false);

    expect(() => {
        new FileSystemNode(null, "directory", true,
            "I am a directory but I have content. I should throw an error.")
    }).toThrow(Error);

});