var Blast = require('protoblast')(false), // Protoblast without native mods
    vm = require('vm'),
    JanewayClass,
    Janeway,
    started = false,
    stripEsc,
    outputs,
    esc;

/**
 * The Janeway class
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.1
 */
JanewayClass = Blast.Collection.Function.inherits(function Janeway() {
	Janeway.super.call(this);
}, Blast.Classes.Informer);

/**
 * Simple function to enter terminal colour codes
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Number|String}  code  The code(s) to escape
 * @param    {String}         str   If given: Add string and reset code
 *
 * @return   {String}
 */
JanewayClass.setMethod(function esc(code, str, endcode) {

	var result = '\u001b[' + code + 'm';

	if (typeof str !== 'undefined') {

		if (typeof endcode === 'undefined') {
			endcode = 0;
		}

		result += str + esc(endcode);
	}

	return result;
});

esc = JanewayClass.prototype.esc;

/**
 * Strip terminal colour escape sequences from a string
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.1
 *
 * @param    {String}  str       The string containing escape sequences
 * @param    {Boolean} literal   Remove literal representations in strings
 *
 * @return   {String}
 */
JanewayClass.setMethod(function stripEsc(str, literal) {
	var result = str.replace(/\u001b\[(\d\;?)+m/g, '');

	if (literal) {
		result = result.replace(/\\u001(?:b|B)\[(\d\;?)+m/, '');
	}

	return result;
});

stripEsc = JanewayClass.prototype.stripEsc;

/**
 * Create augmented versions of the `stdout` and `stderr` objects.
 * After that, we set the `write` functions on those augmented objects.
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.1
 * @version  0.1.1
 */
outputs = {
	stdin: process.stdin,
	stdout: Object.create(process.stdout),
	stderr: Object.create(process.stderr)
};

outputs.stdout.write = process.stdout.write;
outputs.stderr.write = process.stderr.write;

/**
 * Start Janeway
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
JanewayClass.setMethod(function start() {

	var that = this,
	    scrolledUp = true,
	    precontext,
	    context,
	    logList,
	    bottom,
	    output,
	    screen,
	    moved,
	    form,
	    cli,
	    to;

	if (started) {
		console.error('Can not start Janeway twice!');
		return;
	}

	// As soon as this is required, it kicks in and takes over the screen
	blessed = require('blessed');
	screen  = blessed.screen({output: outputs.stdout, error: outputs.stderr});

	// Create the interface boxes
	bottom = blessed.box({
		bottom: '0',
		width: '100%',
		content: '▶',
		height: 2,
		style: {
			bg: 'white',
			fg: 'blue'
		}
	});

	form = blessed.form({
		width: '100%',
		left: 2,
		content: 'FORM',
		style: {
			bg: 'white',
			fg: 'blue'
		}
	});

	cli = blessed.textarea({
		width: '100%',
		left: 0,
		bottom: 0,
		content: 'ghost',
		style: {
			bg: 'white',
			fg: 'blue'
		},
		//inputOnFocus: true,
		mouse: true
		//keys: true
	});

	output = blessed.box({
		bottom: 2,
		left: 0,
		width: '100%',
		height: screen.height-2,
		scrollable: true,
		alwaysScroll: true, // Don't turn this off, or it breaks
		content: 'Line 0',
		wrap: false,
		scrollbar: {
			bg: 'blue'
		},
		style: {
			fg: 'white',
			bg: 'transparent'
		}
	});

	// Create the LogList instance
	logList = new Janeway.LogList(screen, output);

	/**
	 * Keep a reference to the original `console.log`
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console._log = console.log;

	/**
	 * Hijack console.log
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	console.log = function log() {
		logList.consoleLog(Blast.Bound.Array.cast(arguments));
	};

	/**
	 * Hijack console.dir
	 * (Currently the same as log)
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console.dir = function dir() {
		logList.consoleLog(Blast.Bound.Array.cast(arguments));
	};

	/**
	 * Hijack console.info
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console.info = function info() {
		logList.consoleLog(Blast.Bound.Array.cast(arguments), 'info');
	};

	/**
	 * Hijack console.warn
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console.warn = function warn() {
		logList.consoleLog(Blast.Bound.Array.cast(arguments), 'warn');
	};

	/**
	 * Hijack console.error
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console.error = function error() {
		logList.consoleLog(Blast.Bound.Array.cast(arguments), 'error');
	};

	// Prepare to hijack stdout & stderr `write` functions
	to = {
		stdout: process.stdout.write,
		stderr: process.stderr.write
	};

	/**
	 * Hijack stderr output
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	process.stderr.write = function stderrWrite(string, encoding, fd) {
		logList.consoleLog([''+string], 'error');
	};

	/**
	 * Hijack stdout output
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	process.stdout.write = function stdoutWrite(string, encoding, fd) {
		logList.consoleLog([''+string]);
	};

	/**
	 * Handle mouse events (scrolling)
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	output.on('mouse', function onMouse(e) {

		if (e.action == 'wheelup') {
			output.scroll(-5);
			scrolledUp = true;
		} else if (e.action == 'wheeldown') {
			output.scroll(5);
			scrolledUp = false;
		}

		moved = true;

		if (output.getScrollPerc() == 100) {
			moved = false;
		}

		logList.render();
	});

	/**
	 * Handle mouse clicks
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	output.on('click', function(data) {

		var bottomIndex,
		    lineIndex,
		    topIndex,
		    gScroll,
		    scroll,
		    line,
		    str;

		// Scroll index of either top or bottom visible line
		gScroll = output.getScroll();

		if (scrolledUp) {
			topIndex = gScroll;
			bottomIndex = topIndex + output.height - 1;
		} else {
			bottomIndex = gScroll;
			topIndex = bottomIndex - output.height + 1;
		}

		lineIndex = data.y - output.top + topIndex;

		logList.click(lineIndex, data.x, data.y);
	});

	precontext = Blast.Bound.Object.assign({}, global);
	precontext.require = require;

	// Create the context for the CLI code to run in
	context = vm.createContext(precontext);

	/**
	 * Handle input of the CLI
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	cli.on('keypress', function onKeypress(e) {

		var result,
		    commandLine,
		    errorLine,
		    evalLine,
		    scope,
		    cmd;

		if (e == '\r') {
			cmd = cli.getValue().trim();

			// Return if the cmd is empty
			if (cmd) {
				cli.clearValue();
			} else {
				return;
			}

			if (cmd == 'cls') {
				logList.clearScreen();
				cli.clearValue();
				cli.render();
				return;
			} else if (cmd == 'exit') {
				process.exit();
			}

			// Create a line for the input command
			commandLine = new Janeway.CommandLogLine(logList);
			commandLine.set(esc('38;5;74', cmd));

			// Add it to the logList
			logList.pushLine(commandLine);

			try {

				// Run the command using vm
				// @todo: not ideal situation. Should be fixed.
				result = vm.runInContext(cmd, context);

				// Create a line for the output
				evalLine = new Janeway.EvalOutputLogLine(logList);
				evalLine.set([result]);

				logList.insertAfter(evalLine, commandLine.index);
			} catch (err) {
				errorLine = new Janeway.ErrorLogLine(logList);
				errorLine.set([err]);

				logList.insertAfter(errorLine, commandLine.index);
			}

			// Even though the input has been cleared,
			// the return gets added afterwards
			setImmediate(function() {
				cli.clearValue();
				cli.render();
				logList.render();
			});
		}
	});

	// Prepare the screen contents and render
	screen.append(bottom);
	screen.append(output);
	bottom.append(form);
	form.append(cli);
	screen.render();

	// Quit on Escape, q, or Control-C.
	cli.key(['escape', 'C-c'], function exitNow(ch, key) {
		return process.exit(0);
	});

	// The CLI is always in focus
	cli.readInput(function recurse(result) {
		cli.readInput(recurse);
	});

	/**
	 * Listen to the next screen render event,
	 * only then will things be visible on the screen
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	screen.once('render', function onRender() {
		that.emitOnce('ready');
	});
});

Janeway = new JanewayClass();

// Require all the classes
require('./class/log_list.js')(Janeway, Blast, Blast.Bound);
require('./class/log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/args_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/property_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/other_log_line.js')(Janeway, Blast, Blast.Bound);

module.exports = Janeway;