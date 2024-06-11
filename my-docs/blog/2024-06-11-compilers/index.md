---
slug: pearterm/compilers 
title: Learning more about Compilers
authors: [cbloodsworth]
---

# Introduction

I figured I'd start a blog post about my journey learning more about compiler
technology. Since junior year of university, I've been ecstatic about compilers,
their inner workings, how programs can be broken down into base components and
optimized, translated, run, etc...The algorithms to do so are fascinating, as
are the design aspects on what makes a *good* compiler, though I admit the more 
I learn, the less I feel I know.

So, I plan here to document the books I'm reading on the topic, the projects
I am working on and their results. I'm sure I can look back at this in a few 
years and feel like I got some value out of my study -- and maybe (if you're
reading this) you might be able to glean something interesting out of this too.

# Background (University)

I started reading about compilers in a university course, Programming Language
Concepts. (This is also where I realized how passionate I am about programming
linguistics, a topic not unrelated.) The textbook for this course was the
legendary **Crafting Interpeters**, which I admit I have not yet finished in its
entirety. (I will get to it...I promise.) 

The course had us implement a compiler for a toy language, similar to **CI**'s 
lox. We got about as far as code generation -- our program did compile to Java 
and was executable! Unfortunately, the code it generated was quite nasty (let 
alone inefficient), and had no semblance of code optimization. On top of that, 
the course had previously required students to compile to *Java bytecode*, not
just Java source -- which felt like I was missing something. Of course, I could
have implemented the rest after the fact, but as a busy, excuse-making student
I didn't get around to it. Now enough time has passed where I feel like I'd
rather just start from ground zero.

A class I took later on, Object-Oriented Programming, spoke about parsing and
AST generation, and the final project had us develop an argument parsing library
for Java. This was really interesting and I enjoyed working on it, but there's
only so much a single undergraduate course can really cover. That said, the
professor spoke about a programming language he had written and designed
(https://rhovas.dev/ if you're curious) and it got me really interested in the
idea of making my own. I feel like doing so is going to require a lot more
knowledge on my end on both compilers and (more importantly) programming
linguistics.

# Further Background (pearterm)

Recently, I've been working on `pearterm`, a unix-style terminal simulator with 
its own shell. When I first started working on the project, I had a *very* basic
command parser (I'm talking JUST split-on-spaces tokenizer), and it *mostly* did 
the job sufficiently, but there were a few caveats here and there. 

As I went about implementing more commands, I realized that the parser was not 
holding up to some of the more complicated features of the shell (piping and 
redirection, for example.) So I decided to rewrite the command interpreter from
the ground up, and try to follow along with how `bash` did it as neatly as
possible. (Turns out, this is far more grand an undertaking than I had 
originally thought...)

So while I continue development on `pearterm`'s shell, I've decided to start
digging deeper into compiler texts to better understand how I can write this
interpreter effectively. While I don't expect `pearterm`'s shell to be anywhere
near as feature-rich as `bash` or other command-line interpreters, I do hope to
learn a bit coming out of it.

# Anyway, rambling aside...

I am starting to read **Engineering a Compiler**, and I'll document any thoughts
I have on it in coming blog posts. Again, if you've read this far, I'll honestly
say you probably should spend your time reading something more productive, but I
appreciate the attention nonetheless. Thanks for reading! :pear:


