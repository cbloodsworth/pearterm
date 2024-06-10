import { Scanner } from "../src/system/parser/scanner"

test('Scanner parses basic text', () => {
    const scnr = new Scanner("Hello!");
    const tokens = scnr.lex();

    expect(tokens).not.toBe(undefined);
    expect(tokens!.length).toBe(1);
    expect(tokens!.at(0)).toBe("Hello!");
});

test('Basic text with space', () => {
    const scnr = new Scanner("Hello world!");
    const tokens = scnr.lex();

    expect(tokens!.length).toBe(2);
    expect(tokens!.at(0)).toBe("Hello");
    expect(tokens!.at(1)).toBe("world!");
});

test('Single quote', () => {
    const scnr = new Scanner("'Hello world!'");
    const tokens = scnr.lex();

    expect(tokens!.length).toBe(1);
    expect(tokens!.at(0)).toBe("Hello world!");
});

test('Double quote', () => {
    const scnr = new Scanner('"Hello world!"');
    const tokens = scnr.lex();

    expect(tokens!.length).toBe(1);
    expect(tokens!.at(0)).toBe("Hello world!");
});

test('Delimits correctly on pipe operator', () => {
    const scnr = new Scanner('Hello|world!');
    const tokens = scnr.lex();

    expect(tokens!.length).toBe(3);
    expect(tokens!.at(0)).toBe("Hello");
    expect(tokens!.at(1)).toBe("|");
    expect(tokens!.at(2)).toBe("world!");
});

test('Delimits correctly on redirect operator', () => {
    const scnr = new Scanner('Hello>world!');
    const tokens = scnr.lex();

    expect(tokens!.length).toBe(3);
    expect(tokens!.at(0)).toBe("Hello");
    expect(tokens!.at(1)).toBe(">");
    expect(tokens!.at(2)).toBe("world!");
});

test('Delimits correctly on double redirect operator', () => {
    const scnr = new Scanner('Hello>>world!');
    const tokens = scnr.lex();

    expect(tokens!.length).toBe(3);
    expect(tokens!.at(0)).toBe("Hello");
    expect(tokens!.at(1)).toBe(">>");
    expect(tokens!.at(2)).toBe("world!");
});

test('Delimits correctly on operator with space', () => {
    const scnr = new Scanner('Hello > world!');
    const tokens = scnr.lex();

    expect(tokens!.length).toBe(3);
    expect(tokens!.at(0)).toBe("Hello");
    expect(tokens!.at(1)).toBe(">");
    expect(tokens!.at(2)).toBe("world!");
});

// TODO: Add test for unclosed quotes.
// test('Returns null if unclosed quote', () => {
//     const scnr = new testParserModules.Scanner('"Hello world!');
//     const tokens = scnr.lex();

//     expect(tokens).toBe(null);
// });

test('Multiple operators', () => {
    const scnr = new Scanner('Multiple | operators | are | being >> used.');
    const tokens = scnr.lex();

    expect(tokens!.at(0)).toBe("Multiple");
    expect(tokens!.at(1)).toBe("|");
    expect(tokens!.at(2)).toBe("operators");
    expect(tokens!.at(3)).toBe("|");
    expect(tokens!.at(4)).toBe("are");
    expect(tokens!.at(5)).toBe("|");
    expect(tokens!.at(6)).toBe("being");
    expect(tokens!.at(7)).toBe(">>");
    expect(tokens!.at(8)).toBe("used.");
});

test('Quotes with operators', () => {
    const scnr = new Scanner('echo "Hello" >> a.txt');
    const tokens = scnr.lex();

    expect(tokens!.at(0)).toBe("echo");
    expect(tokens!.at(1)).toBe("Hello");
    expect(tokens!.at(2)).toBe(">>");
    expect(tokens!.at(3)).toBe("a.txt");
});

test('Comment', () => {
    const scnr = new Scanner('ls #comment, ignore');
    const tokens = scnr.lex();

    expect(tokens!.at(0)).toBe("ls");
    expect(tokens!.at(1)).toBe("#comment, ignore");
});