# Janeway Development Guide

## Overview

Janeway is a Node.js console REPL with an interactive TUI (Terminal User Interface). It provides:
- Interactive object inspection (clickable, expandable properties)
- Syntax-highlighted CLI input with autocomplete
- Hex viewer for binary Buffers
- Status bar with spinners
- Console hijacking (reformats console.log/warn/error output)

Used by AlchemyMVC to provide an enhanced development console.

## Usage

```javascript
const Janeway = require('janeway');

Janeway.start(options, callback);

// Logging (or just use console.log - it's hijacked)
Janeway.print('info', ['message', object]);

// Status bar
Janeway.setStatus('Processing...');
Janeway.setStatus({text: 'Loading', spinner: 'dots'});

// Terminal title
Janeway.setTitle('My App');

// Menu indicators
Janeway.addIndicator('⚡', {weight: 10, callback: () => {}});
```

## Architecture

### Screen Layout (TUI mode)
```
┌─────────────────────────────────────────┐
│ [Copy JSON]              indicators...  │ ← Menu bar (height: 1)
├─────────────────────────────────────────┤
│                                         │
│ Log output (scrollable, clickable)      │ ← LogList manages LogLines
│                                         │
├─────────────────────────────────────────┤
│ > cli input                    status   │ ← Editarea + Status
└─────────────────────────────────────────┘
```

### Logging Pipeline
```
console.log(value)
  → Janeway.print('info', args, options)
    → LogList.consoleLog(args, type, options)
      → Creates LogLine subclass (InfoLogLine, ArgsLogLine, etc.)
      → line.dissect() - breaks args into inspectable parts
      → LogList.pushLine(line)
        → Renders to blessed box
```

### Key Classes

**JanewayClass** (`lib/init.js`)
- Main singleton, controls TUI via `reblessed`
- Hijacks console methods
- Manages VM context for CLI evaluation

**LogList** (`lib/class/log_list.js`)
- Manages output box content
- Array of LogLine instances
- Handles scroll, click, drag events
- Deduplicates consecutive identical lines

**LogLine hierarchy** (`lib/class/`):
- `LogLine` - Base class with gutter, fileinfo, coloring
- `ArgsLogLine` - Multiple arguments, dissects into properties
- `PropertyLogLine` - Single object property
- `StringLogLine` - String display
- `HexLogLine` - Buffer hex viewer
- `CommandLogLine`, `EvalOutputLogLine` - CLI I/O
- `ErrorLogLine`, `WarningLogLine`, `InfoLogLine` - Log types

**Status** (`lib/class/status.js`) - Bottom status bar with spinner support

**Indicator** (`lib/class/indicator.js`) - Top menu bar items

## Configuration

User config: `~/.janeway/janeway.js` or `~/.janeway/janeway.json`

Key options for `Janeway.start(options)`:
```javascript
{
    output_to_stdout: false,  // Also write to stdout (not just TUI)
    screen: null,             // Custom blessed screen
    extra_output: null,       // Additional output stream
}
```

## Custom Object Display

Objects can customize their Janeway representation using symbols:

```javascript
const Janeway = require('janeway');

class MyClass {
    get [Janeway.ARG_LEFT]() {
        return 'MyClass';      // Yellow left side: type/name
    }
    get [Janeway.ARG_RIGHT]() {
        return '5 items';      // White right side: size/summary
    }
}
// Displays as: {MyClass 5 items}
```

## Log Levels

```javascript
Janeway.LEVELS = {
    FATAL: 0, SEVERE: 1, ERROR: 2, WARNING: 3,
    TODO: 4, INFO: 5, DEBUG: 6, HIDEBUG: 7
};
```

## Directory Structure

```
lib/
├── init.js              # Main JanewayClass (2600+ lines)
├── class/
│   ├── log_list.js      # Output management
│   ├── log_line.js      # Base log line class
│   ├── args_log_line.js # Argument dissection & inspection
│   ├── property_log_line.js
│   ├── string_log_line.js
│   ├── hex_log_line.js  # Binary hex viewer
│   ├── other_log_line.js # Command, Eval, Error, Warning, Info lines
│   ├── editarea.js      # CLI input widget
│   ├── indicator.js     # Menu indicators
│   └── status.js        # Status bar
└── spinners.js          # Spinner animation frames
```

## Interactive vs Non-Interactive Mode

**Interactive (TUI):**
- Requires TTY (`process.stdout.isTTY === true`)
- Full blessed screen with mouse/keyboard
- Object inspection, autocomplete, status bar
- `Janeway.start()` creates `this.logList`

**Non-Interactive (stdout):**
- When `!this.logList` (Janeway not started) or `output_to_stdout: true`
- Goes through `print()` method lines 985-1043
- Format: `[type] [file:line] inspected_args...`

**Compact mode** (automatic for LLM/CI contexts):
- Enabled when `!process.stdout.isTTY` or `JANEWAY_COMPACT=1` env var
- No ANSI colors (also strips from string arguments)
- No terminal title escape sequences
- Objects summarized: `depth: 1`, `maxArrayLength: 3`, `maxStringLength: 100`
- Output format: `file:line  message` (info/log) or `[error] file:line  message`

## VM Context

CLI input is evaluated in a separate VM context:
- `$0` - Last selected/clicked value
- All requires resolve from `process.cwd()/node_modules`
- Supports `await` at top level

## Gotchas

1. **TTY required for TUI** - Janeway checks `process.stdout.isTTY`; fails gracefully without it

2. **Console hijacking** - `console.log/warn/error` are replaced; original saved as `console._log` etc.

3. **Deduplication** - Identical consecutive logs show count instead of repeating

4. **Color handling** - In compact mode (non-TTY), colors are never added; otherwise stripped if `!COLORTERM`

5. **ArgsLogLine.dissect()** - Core method that breaks objects into displayable parts; uses `ARG_LEFT`/`ARG_RIGHT` symbols

6. **Blessed library** - Uses `reblessed` (fork of blessed) for TUI; screen.render() is throttled
