Janeway
=======

A curses/blessed-based console, inspired by the developer tools in Webkit/Blink.

[![NPM version](http://img.shields.io/npm/v/janeway.svg)](https://npmjs.org/package/janeway) 
[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=skerit&url=https://github.com/skerit/janeway&title=Janeway&language=&tags=github&category=software)

![Console](https://raw.githubusercontent.com/skerit/janeway/master/img/console-02.gif "Console")

## Install

Install it for use in your own application:

`npm install janeway`

Or use it globally:

`npm install -g janeway`

## Features

* Interactive command line, that always has focus
* Autocomplete
* Output is clickable. Variables can be inspected, just like in the browser

## Todo

* Use editor-widget for CLI: https://github.com/slap-editor/editor-widget
* Improve command-line eval/vm situation
* Improve colouring
* Improve multiline support
* Filename & line information per log line
* Add Janeway quotes
* ...

As you can see, there's a lot that still needs to be done.

## Use it globally

Start your applications like so:

`janeway my_js_file.js`

## Use as standalone

If you just want to give it a go, try out the `start.js` file in Janeway's main folder:

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
Janeway.scroll_down = false;
```

## uncaughtExceptions

By default Janeway will add an `uncaughtException` handler.

It simple re-throws the error to circumvent `blessed`'s one,
which would hide the error message and stacktrace.

As soon as you add another listener, Janeway will ignore uncaught
exceptions and let you handle them.

You can also let Janeway simply print out errors, instead of closing:

```
Janeway.shutdown_on_exception = false;
```

This is not recomended, but can be useful during development.

## Author

You can follow me on twitter: [![Twitter](http://i.imgur.com/wWzX9uB.png)@skeriten](https://www.twitter.com/skeriten)


## License

MIT
