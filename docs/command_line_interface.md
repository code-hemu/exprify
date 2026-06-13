# Command Line Interface

Exprify ships with a built-in command-line interface (CLI) that lets you evaluate mathematical and logical expressions directly from your terminal - no need to open a script file or write boilerplate code. It supports one-off evaluations, piped input from other commands, and a full interactive REPL (Read-Eval-Print Loop) for exploratory work.

This makes Exprify useful not just as a library, but as a quick everyday calculator, a scripting utility for shell pipelines, and a sandbox for testing how expressions are parsed and evaluated.

## Installation Check

Before using the CLI, make sure Exprify is installed and accessible on your `PATH`. You can confirm this by checking the version:

```bash
exprify --version
```

If the command is not found, ensure your package manager's global bin directory is included in your shell's `PATH`.

## Usage

Exprify can be invoked in three primary ways, depending on your workflow.

### 1. Direct Expression Evaluation

Pass an expression as a quoted argument and Exprify will evaluate it immediately and print the result:

```bash
exprify "2 + 2"
# => 4
```

This works well for quick calculations, embedding inside shell scripts, or chaining with other commands.

```bash
exprify "sqrt(16) + 2^3"
# => 12
```

### 2. Piped Input

Exprify can read an expression from standard input (stdin), which is useful when the expression is generated dynamically by another program:

```bash
echo "2+2" | exprify
# => 4
```

```bash
cat expression.txt | exprify
```

### 3. Interactive REPL

Running `exprify` with no arguments and no piped input launches an interactive REPL session. This is ideal for exploring expressions, testing functions, and working with variables across multiple evaluations:

```bash
exprify
```

```
exprify> 2 + 2
4
exprify> x = 10
10
exprify> x * 5
50
```

## Options

The following flags can be passed when invoking `exprify` directly:

| Flag | Description |
|---|---|
| `--help` / `-h` | Display the help message, including usage examples and a summary of available flags. |
| `--version` / `-v` | Print the currently installed version of Exprify. |
| `--parse <expr>` | Parse the given expression without evaluating it, and display both the token stream and the resulting Abstract Syntax Tree (AST). Useful for debugging custom grammars or understanding operator precedence. |
| `--tokens <expr>` | Tokenize the given expression and display only the resulting list of tokens, without building an AST or evaluating. |

### Example: Inspecting Parsing Behavior

```bash
exprify --tokens "2 + 3 * 4"
```

```
[NUMBER(2), PLUS, NUMBER(3), STAR, NUMBER(4)]
```

```bash
exprify --parse "2 + 3 * 4"
```

```
Tokens:
[NUMBER(2), PLUS, NUMBER(3), STAR, NUMBER(4)]

AST:
(+ 2 (* 3 4))
```

## REPL Commands

Once inside the REPL, you can type any valid expression to evaluate it, or use one of the following special commands:

| Command | Description |
|---|---|
| `.help` | Show a list of available REPL commands and shortcuts. |
| `.exit`, `exit`, `quit` | Exit the REPL session and return to your shell. |
| `<expr>` | Evaluate any valid expression and print the result. |
| `Ctrl+C` | Cancel the current input line, or exit the REPL if pressed on an empty line. |

### REPL Features

The REPL is designed to make interactive exploration comfortable and efficient:

- **Tab completion** - Press `Tab` while typing to auto-complete the names of common functions (e.g., `sqrt`, `sin`, `cos`) and constants (e.g., `pi`, `e`).
- **Colored output** - Results, errors, and warnings are syntax-highlighted for readability, making it easy to distinguish values from error messages at a glance.
- **Persistent evaluation context** - Variables and assignments persist across expressions within the same session, allowing you to build up calculations step by step.

```
exprify> a = 5
5
exprify> b = a * 2
10
exprify> a + b
15
exprify> exit
```

## Tips

- Wrap expressions containing spaces or special shell characters (like `*`, `(`, `)`, or `|`) in quotes to prevent your shell from interpreting them.
- Use `--tokens` and `--parse` as debugging tools when an expression doesn't evaluate the way you expect.
- The REPL's persistent context makes it well suited for multi-step calculations - define variables once and reuse them throughout your session.