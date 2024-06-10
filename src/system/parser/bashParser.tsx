import { Command } from "../commands";
import { Tokenizer } from "./tokenizer";
import { Validator } from "./validator";

export const parse = (source: string): Command => {
    return new Validator(new Tokenizer(source).tokenize()).parse();
}
