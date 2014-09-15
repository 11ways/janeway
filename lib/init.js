var Blast = require('protoblast')(false), // Protoblast without native mods
    vm = require('vm'),
    started = false,
    stripEsc,
    esc;

/**
 * The Janeway function/object
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
function Janeway() {
	Janeway.start();
};

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
Janeway.esc = function esc(code, str, endcode) {

	var result = '\u001b[' + code + 'm';

	if (typeof str !== 'undefined') {

		if (typeof endcode === 'undefined') {
			endcode = 0;
		}

		result += str + esc(endcode);
	}

	return result;
};

esc = Janeway.esc;

/**
 * Strip terminal escape sequences from a string
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}  str   The string containing escape sequences
 *
 * @return   {String}
 */
Janeway.stripEsc = function stripEsc(str) {
	return str.replace(/\u001b\[(\d\;?)+m/g, '');
};

stripEsc = Janeway.stripEsc;

// Require all the classes
require('./class/log_list.js')(Janeway, Blast, Blast.Bound);
require('./class/log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/args_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/property_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/other_log_line.js')(Janeway, Blast, Blast.Bound);

/**
 * Start Janeway
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Janeway.start = function start() {

	var scrolledUp = true,
	    precontext,
	    context,
	    logList,
	    bottom,
	    output,
	    screen,
	    moved,
	    form,
	    cli;

	if (started) {
		console.log('Can not start Janeway twice!');
		return;
	}

	// As soon as this is required, it kicks in and takes over the screen
	blessed = require('blessed');
	screen  = blessed.screen();

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
	})
};

module.exports = Janeway;