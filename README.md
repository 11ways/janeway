Janeway
=======

A curses/blessed-based console, inspired by the developer tools in Webkit/Blink.

![Console](https://raw.githubusercontent.com/skerit/janeway/master/img/console-01.png "Console")

## Install

`npm install janeway`

## Features

* Interactive command line, that always has focus
* Output is clickable. Variables can be inspected, just like in the browser

## Todo

* Improve command-line eval/vm situation
* Fix bugs & screen glitches
* Improve colouring
* Improve multiline support
* Filename & line information per log line
* Add Janeway quotes
* ...

As you can see, there's a lot that still needs to be done.

## Use as standalone

If you just want to give it a go:

`node start.js`

## Use in your application

You can load Janeway like this:

```javascript
var Janeway = require('janeway');

// Janeway will take over the screen only when you call start
Janeway.start();
```

The screen automatically scrolls down when a new line is pushed (unless you've scrolled the screen manually).
You can disable this like so:

```javascript
Janeway.scrollDown = false;
```

## License

MIT