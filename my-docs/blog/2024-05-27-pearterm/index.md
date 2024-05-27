---
slug: pearterm/intro 
title: Introduction to pearterm
authors: [cbloodsworth]
---

## Overview
Hello! I'm Chris. If you're here, you might be curious about **pearterm**, a
pet project of mine that I've really come to enjoy working on.

I've been working on **pearterm** this past year, and decided to finally write
some proper documentation for it, since it's starting to get complex. Alongside
this documentation, I figured I could start a blog talking about new features
and whatnot.

## What is pearterm?
**pearterm** (all lowercase) is a terminal _simulator_ written from scratch,
using entirely Typescript/React. I initially started it as a portfolio site to
show off some of my work (with a terminal-style twist), but it evolved into 
being a full-on unix-style simulator. Note that it is not an emulator: I'm 
attempting to follow standards wherever possible, but I mainly want to build a 
system that looks and feels like a unix terminal _from the ground up_. 

Nowhere in this project is an existing terminal being called or accessed in any 
way -- all logic is built in-house. I'm using this mainly as a learning 
exercise to see how these types of systems are typically built, so I can have a 
better appreciation for unix systems and terminals in general. I am fascinated
with large software systems and hope to learn a lot with this.

## Birds-eye-view of pearterm's Internals
I figure I'll go into more detail in different blog posts later, but at its
core, **pearterm** is built up into a few separate parts, that work mostly
independently:
- Terminal View and User Interface
- Interpreter / Argument Parser
- Command Implementation
- File System

Essentially, the Terminal View (what the user sees) takes input, passes
it to the interpreter, which tests the input against valid arguments / commands
defined in the argument parser. When it finds a match with a defined command,
it sends the freshly parsed input into the implementation, which may produce
a result, or may modify the file system. The file system is represented as a
tree of file system nodes.

All of this is likely subject to change as I learn more about developing these
kinds of systems, but they are neatly separated in a way that I can easily
modify one piece without destroying everything else. If I wanted to upgrade
my parser, as long as it returns objects in a format that the implementation
expects, everything will just work:tm:. That's the hope, anyway.

## Close-off
I appreciate you taking the time to read this post. I plan to make more in
the future about different features I am adding, or plan to add, and how to
use them. Ideally, since **pearterm** is designed to act as close as possible
to a unix-style terminal, everything _should_ conform to standards. This is 
not 100% realistic, though; I'm still learning as I go, so I'll likely
also write proper documentation on unexpected behavior or deviation from
standards. Thank you! :pear:
