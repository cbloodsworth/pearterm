import { ansiToColor, htmlToColor } from "../src/system/formatContentParser.tsx";
import { TerminalColors } from "../src/components/terminal.tsx";

export const themes: {[key: string]: TerminalColors} = {
    "default": {
        default: ansiToColor(15)!,
        primary: ansiToColor(12)!,
        mute: ansiToColor(7)!,
        success: ansiToColor(10)!,
        info: ansiToColor(13)!,
        warning: ansiToColor(11)!,
        error: ansiToColor(1)!,
        background: ansiToColor(16)!,
        description: `
Default look for a typical Linux terminal.`
    },
    "solarized-light": {
        default: htmlToColor("#657b83")!,
        primary: htmlToColor("#859900")!,
        mute: htmlToColor("#93a1a1")!,
        success: htmlToColor("#cb4b16")!,
        info: htmlToColor("#2aa198")!,
        warning: htmlToColor("#b58900")!,
        error: htmlToColor("#dc322f")!,
        background: htmlToColor("#eee8d5")!,
        lightTheme: true,
        description: `
Precision colors for machines and people.\n
All credit to Ethan Schoonover. Learn more at\n
https://ethanschoonover.com/solarized/`
    },
    "solarized-dark": {
        default: htmlToColor("#839496")!,
        primary: htmlToColor("#859900")!,
        mute: htmlToColor("#586e75")!,
        success: htmlToColor("#cb4b16")!,
        info: htmlToColor("#2aa198")!,
        warning: htmlToColor("#b58900")!,
        error: htmlToColor("#dc322f")!,
        background: htmlToColor("#002b36")!,
        description: `
Precision colors for machines and people.\n
All credit to Ethan Schoonover. Learn more at\n
https://ethanschoonover.com/solarized/`
    },
    "discord-dark": {
        default: htmlToColor("#ffffff")!,
        primary: htmlToColor("#5865f2")!,
        mute: htmlToColor("99aab5")!,
        success: htmlToColor("#7289da")!,
        info: htmlToColor("#ee459e")!,
        warning: htmlToColor("fee75c")!,
        error: htmlToColor("#ed4245")!,
        background: htmlToColor("#23272a")!,
        description: `
Calm tones based on Discord, a communication app.\n
Learn more at https://discord.com/
`
    },
    "rose-pine": {
        default: htmlToColor("#e0def4")!,
        primary: htmlToColor("#9ccfd8")!,
        mute: htmlToColor("#6e6a86")!,
        success: htmlToColor("#31748f")!,
        info: htmlToColor("#c4a7e7")!,
        warning: htmlToColor("#f6c177")!,
        error: htmlToColor("#eb6f92")!,
        background: htmlToColor("#191724")!,
        description: `
All natural pine, faux fur and a bit of soho vibes for the classy minimalist.\n
Learn more at https://rosepinetheme.com/ and donate at\n
https://www.patreon.com/rosepine
`
    },
    "rose-pine-moon": {
        default: htmlToColor("#e0def4")!,
        primary: htmlToColor("#9ccfd8")!,
        mute: htmlToColor("#6e6a86")!,
        success: htmlToColor("#3e8fb0")!,
        info: htmlToColor("#c4a7e7")!,
        warning: htmlToColor("#f6c177")!,
        error: htmlToColor("#eb6f92")!,
        background: htmlToColor("#232136")!,
        description: `
All natural pine, faux fur and a bit of soho vibes for the classy minimalist.\n
Learn more at https://rosepinetheme.com/ and donate at\n
https://www.patreon.com/rosepine
`
    },
    "rose-pine-dawn": {
        default: htmlToColor("#575279")!,
        primary: htmlToColor("#56949f")!,
        mute: htmlToColor("#9893a5")!,
        success: htmlToColor("#286983")!,
        info: htmlToColor("#907aa9")!,
        warning: htmlToColor("#ea9d34")!,
        error: htmlToColor("#b4637a")!,
        background: htmlToColor("#faf4ed")!,
        lightTheme: true,
        description: `
All natural pine, faux fur and a bit of soho vibes for the classy minimalist.\n
Learn more at https://rosepinetheme.com/ and donate at\n
https://www.patreon.com/rosepine
`
    },
}