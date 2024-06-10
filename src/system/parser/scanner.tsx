export class Scanner {
    source: string;
    start: number;  // start of current consumption
    current: number;  // index lexer is currently at
    rawTokens: string[];

    constructor(source: string) {
        this.source = source.trim();
        this.start = 0;
        this.current = 0;
        this.rawTokens = [];
    }

    /** Get the character `num` after current, or "" if none exists  */
    get = (num: number) => this.source.charAt(this.current + num);

    /** Check if a character exists `num` after current */
    has = (num: number) => (this.get(num) != "");

    /** Gets the character at current */
    getNext = () => this.get(0);

    /** Check if a character at current */
    hasNext = () => this.has(0);

    /**
     *  Takes the subtring from [start, current) and pushes it to rawTokens.
     *  Sets start = current.
     */
    consume = () => {
        // If what we're consuming starts with #, it's a comment -- get rid of the rest of the line up til \n
        if (this.source.at(this.start) === '#') {
            let commentEnd = this.source.indexOf('\n');
            if (commentEnd === -1) { commentEnd = this.source.length; }

            this.rawTokens.push(this.source.substring(this.start, commentEnd));

            this.current = commentEnd;
            this.start = this.current;

            return;
        }

        // Otherwise, consume as usual
        const substr = this.source.substring(this.start, this.current);
        if (substr.length != 0) this.rawTokens.push(substr);
        this.start = this.current;
    }

    /**
     * Shifts the low and high pointer by one, effectively skipping the character.
     */
    forward = () => {
        this.start++;
        this.current++;
    }

    /**
     * Skips until non-whitespace character
     */
    skipSpaces = () => {
        while (this.hasNext() && this.getNext() === ' ') {
            this.forward();
        }
        this.current--;
    }

    lex = (): string[] => {
        // Character array for different scope identifiers like ' or "
        while (this.hasNext()) {
            const currentChar = this.getNext();
            switch (currentChar) {
                case ('\''): // Single quote
                case ('"'):  // Double quote
                {
                    this.consume();
                    this.forward();

                    let closedQuote = false;
                    while (this.hasNext()) { 
                        this.current++;
                        if (this.getNext() === currentChar) {
                            this.consume();
                            closedQuote = true;
                            break;
                        }
                    }

                    if (!closedQuote) {
                        // We should do something here probably
                    }

                    this.forward();
                    this.skipSpaces();

                    break;
                }
                case ('|'): case ('>'):
                case (' '):  // Split on spaces by default
                {
                    const gatherOp = (currentChar !== ' ')
                    this.consume();

                    if (gatherOp) { 
                        // for >>
                        if (currentChar === '>' && this.get(1) === '>') {
                            this.current++;
                        }
                        this.current++;
                        this.consume(); 
                    }

                    this.skipSpaces();

                    break;
                }
            }
            this.current++;
        }

        this.consume();

        console.log(this.rawTokens);
        return this.rawTokens;
    }
}

