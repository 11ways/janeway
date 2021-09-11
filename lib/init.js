const { TIMEOUT } = require('dns');

// If Janeway has already been loaded, return that
if (typeof __Janeway !== 'undefined') {
	module.exports = __Janeway;
	return;
}

var blessed = require('neo-blessed'),
    Blast = require('protoblast')(false), // Protoblast without native mods
    util  = require('util'),
    ncp   = require('copy-paste'),
    vm    = require('vm'),
    os    = require('os'),
    fs    = require('fs'),
    JanewayClass,
    vm_context,
    Janeway,
    starting = false,
    started = false,
    libpath = require('path'),
    multiply = Blast.Bound.String.multiply,
    counter = 0,
    Editarea,
    stripEsc,
    outputs,
    Status,
    esc;

/**
 * The Janeway class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.3.0
 */
JanewayClass = Blast.Collection.Function.inherits('Informer', 'Develry.Janeway', function Janeway() {

	// Open popup boxes
	this.open_popups = {};

	// Current cli history index
	this.cli_history_index = -1;

	// The stashed cli input
	this.cli_stash = '';

	// Status lines
	this.status_lines = [];

	// Empty options objects (Gets overwritten on `start`)
	this.options = {};

	// Create the context which will be used for evaluating code
	vm_context = Object.create(global);
	vm_context.module = module;
	vm_context.janeway = this;
	vm_context.cls = null;

	this.vm_context = new vm.createContext(vm_context);

	/**
	 * Set current working directory first
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.2.0
	 */
	vm_context.require = function _require(path) {

		try {
			// Try regular require first, in case of requiring built-in modules
			return require(path);
		} catch (err) {
			path = libpath.resolve(process.cwd(), 'node_modules', path);
			return require(path);
		}
	};
});

/**
 * Expose Protoblast
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.0
 * @version  0.2.0
 */
JanewayClass.setProperty('Blast', Blast);

/**
 * Spinners object
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.0
 * @version  0.2.0
 */
JanewayClass.setProperty('spinners', {});

/**
 * Scrolldown on new data (true by default)
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
JanewayClass.setProperty('scroll_down', true);

/**
 * Has the user scrolled manually?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
JanewayClass.setProperty('scrolled_manually', false);

/**
 * Add an uncaughtException handler?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.6
 * @version  0.1.6
 */
JanewayClass.setProperty('catch_exceptions', true);

/**
 * Shutdown on caught exceptions?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.6
 * @version  0.3.0
 */
JanewayClass.setProperty('shutdown_on_exception', false);

/**
 * Re-emit caught uncaughtExceptions on Janeway?
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.6
 * @version  0.1.6
 */
JanewayClass.setProperty('re_emit_exceptions', false);

/**
 * Verbosity levels
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 */
JanewayClass.setProperty('LEVELS', {
	'FATAL':     0,
	'SEVERE':    1,
	'ERROR':     2,
	'WARNING':   3,
	'TODO':      4,
	'INFO':      5,
	'DEBUG':     6,
	'HIDEBUG':   7
});

/**
 * Default indicator options
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.1
 * @version  0.2.1
 */
JanewayClass.setProperty('default_indicator_options', {

	// Default content icon
	icon         : '◆',

	// Indicator class name
	type         : '',

	// Weight of the indicator (for position)
	weight       : 10
});

/**
 * Default config
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.3
 * @version  0.3.4
 */
JanewayClass.setProperty('default_config', {
	autocomplete: {
		enabled : true,
		height  : 6
	},
	execbin: {
		evaluate_files: false
	},
	shortcuts: {
		exit: ['C-c']
	},
	caller_info: {
		stack_size: 6,
		max_filename_length: 10,
		min_length: 25
	},
	properties: {
		alike_objects  : false,
		date_format    : 'D Y-m-d H:i:s',
		show_get_value : false,
		sort           : true
	},
	strings: {
		ellipsis : '…',
		gutters: {
			// Fancy >
			input   : '\u276f ',

			// Fancy <
			output  : '\u276e ',

			// Skull
			error   : '\u2620 Error:',

			// Warning sign
			warning : '\u26a0 ',

			// Circled small letter i
			info    : '\u24D8 '
		}
	},
	output: {
		style : {
			bg: 'transparent',
			fg: 'white'
		},
		scrollbar: {
			bg: 'blue'
		}
	},
	cli: {
		style : {
			bg : 'white',
			fg : 'blue'
		},
		unselect_on_return: true
	},
	status: {
		enabled : false,
		height  : 1,
		style   : {
			bg : 'grey',
			fg : 'white'
		}
	},
	popup: {
		scrollbar: {
			bg : 'green'
		},
		border: {
			type: 'line'
		},
		style: {
			bg: 'blue',
			fg: 'white'
		},
		shadow: true
	},
	menu: {
		style : {
			bg : 'white',
			fg : 'black',
			selected : {
				bg: 'white',
				fg: 'red'
			}
		},
		button : {
			bg    : 'white',
			fg    : 235, // Shade of grey
			focus : {
				bg: 'red',
				fg: 249 // Shade of grey
			},
			hover: {
				bg: 'red',
				fg: 249 // Shade of grey
			}
		}
	},
	indicator: {
		style: {
			border: {
				bg: 240,
				fg: 231
			},
			bg: 240,
			fg: 231
		}
	},
	menu_item: {
		style: {
			bg: 240,
			fg: 231,
			hover: {
				bg: 'red',
				fg: 249
			},
			selected: {
				bg: 100
			}
		}
	},
	cli_history: {
		save      : 100,
		per_title : true
	},
	blessed: {
		screen: {
			smartCSR                 : true,
			handleUncaughtExceptions : false,
			fullUnicode              : true,

			// "Back Color Erase" messes with the scrollbar
			useBCE                   : false
		}
	}
});

/**
 * The console width
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.5
 * @version  0.3.3
 */
JanewayClass.setProperty(function screen_width() {

	if (this.main_screen && this.main_screen.width) {
		return this.main_screen.width;
	}

	return process.stdout.columns || 80;
}, function setWidth(width) {

	var has_changed = false;

	if (this.main_screen.width != width) {
		has_changed = true;
	}

	if (process.stdout.columns != width) {
		process.stdout.columns = width;
	}

	if (has_changed) {
		this.screen.program.cols = width;
		this.output.width = width;
		this.bottom.width = width;
		this.status.width = width;
		this.form.width = width;
		this.menu.width = width;
		this.cli.width = width;
		this.redraw();
	}
});

/**
 * The console height
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.5
 * @version  0.3.3
 */
JanewayClass.setProperty(function screen_height() {

	if (this.main_screen && this.main_screen.height) {
		return this.main_screen.height;
	}

	return process.stdout.rows || 24;
}, function setHeight(height) {

	var has_changed = false;

	if (this.main_screen.height != height) {
		has_changed = true;
	}

	if (process.stdout.height != height) {
		process.stdout.height = height;
	}

	if (has_changed) {
		this.screen.program.rows = height;
		this.output.height = height - (3 + this.status.height);
		this.redraw();
	}
});

/**
 * Get the correct cli_history when it's needed
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.3
 * @version  0.2.3
 *
 * @type    {Array}
 */
JanewayClass.prepareProperty(function cli_history() {

	var filename;

	if (this.config.cli_history.per_title) {
		if (this._title) {
			filename = __Protoblast.Bound.String.slug(this._title) + '.json';
		}
	}

	if (!filename || filename == 'janeway.json') {
		filename = 'history.json';
	}

	this.history_path = libpath.resolve(this.user_janeway_path, filename);

	try {
		history = require(this.history_path);

		if (Array.isArray(history)) {
			return history;
		}
	} catch (err) {
		// Ignore
	}

	return [];
});

/**
 * Simple function to enter terminal colour codes
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
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
 * @author   Jelle De Loecker   <jelle@develry.be>
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
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.1
 * @version  0.1.1
 */
outputs = {};

// Try getting the standard inputs/outputs
try {
	outputs.stdin = process.stdin;
	outputs.stdout = Object.create(process.stdout);
	outputs.stderr = Object.create(process.stderr);

	outputs.stdout.write = process.stdout.write;
	outputs.stderr.write = process.stderr.write;
} catch (err) {
	// This will fail on nw.js in windows
}

/**
 * Set the terminal tab title
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.0
 * @version  0.2.5
 *
 * @param    {String}  title
 */
JanewayClass.setMethod(function setTitle(title) {

	var cmd;

	// Create the command string if a title is given
	if (typeof title == 'string') {
		cmd = String.fromCharCode(27) + ']0;' + title + String.fromCharCode(7);
		this._title_has_been_set = true;
		this._title = title;
	} else {
		// Revert the title
		cmd = String.fromCharCode(27) + ']2;' + String.fromCharCode(7);
		this._title_has_been_set = false;
		this._title = '';
	}

	this.writeToOuput(cmd);
});

/**
 * Write to the output
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.5
 * @version  0.2.5
 *
 * @param    {String}  cmd
 */
JanewayClass.setMethod(function writeToOuput(cmd) {

	if (this.main_screen && this.main_screen.options && this.main_screen.options.output) {
		this.main_screen.options.output.write(cmd);
	} else {
		outputs.stdout.write(cmd);
	}
});

/**
 * Set the bottom status bar
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.0
 * @version  0.2.1
 *
 * @param    {String}          text
 * @param    {Boolean|String}  spinner
 *
 * @return   {Janeway.Status}
 */
JanewayClass.setMethod(function setStatus(text, spinner) {

	if (this.current_status) {
		this.current_status.stop();
	}

	this.current_status = new Janeway.Status(this, text, spinner);

	return this.current_status;
});

/**
 * Add indicator
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.1
 * @version  0.3.4
 *
 * @param    {Object} options
 *
 * @return   {Janeway.Indicator}
 */
JanewayClass.setMethod(function addIndicator(options) {

	var constructor,
	    indicator,
	    children,
	    name,
	    temp,
	    i;

	if (typeof options == 'string') {
		options = {
			icon : options
		};
	}

	options = Blast.Bound.Object.assign({}, this.default_indicator_options, options);

	if (options.type) {
		children = Janeway.Indicator.getChildren();
		name = Blast.Bound.String.classify(options.type) + 'Indicator';

		for (i = 0; i < children.length; i++) {
			temp = children[i];

			if (temp.name == name) {
				constructor = temp;
				break;
			}
		}
	}

	if (!name && !options.name) {
		name = 'indicator_' + (counter++);
		options.name = name;
	}

	if (!constructor) {
		constructor = Janeway.Indicator;
	}

	indicator = new constructor(this, options);

	return indicator;
});

/**
 * Output debug messages to an external file
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.2
 * @version  0.1.2
 *
 * @param    {Mixed}  message
 */
JanewayClass.setMethod(function debug(message) {

	var str;

	if (message instanceof Error) {
		str = message.message + '\n' + message.stack;
	} else {
		str = require('util').inspect(message, {colors: true});
	}

	require('fs').appendFileSync('/tmp/janewaydebug.log', str + '\n');
});

/**
 * Redraw the screen
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.1
 * @version  0.2.5
 */
JanewayClass.setMethod(function redraw() {
	this.screen.realloc();
	this.screen.render();
});

/**
 * Set the screen terminal
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.5
 * @version  0.2.5
 *
 * @param    {String}   terminal_type
 */
JanewayClass.setMethod(function setTerminal(terminal_type) {

	if (!terminal_type) {
		terminal_type = this.screen.terminal;
	}

	this.screen.setTerminal(terminal_type);
});

/**
 * Extract info from a single stack line
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.1.3
 * @version  0.1.3
 *
 * @param   {String}   caller_line   The string
 *
 * @return  {Object}   An object containing the info
 */
JanewayClass.setMethod(function extractLineInfo(caller_line) {

	var result,
	    index,
	    clean,
	    temp;

	// Get the index
	index = caller_line.indexOf('at ');

	// Get the error line, without the '  at ' part
	clean = caller_line.slice(index+2, caller_line.length);

	result = /^ (.*?) \((.*?):(\d*):(\d*)\)/.exec(clean);

	// If nothing was found, it's probably an anonymous function
	if (!result) {
		temp = /(.*?):(\d*):(\d*)/.exec(clean);

		if (!temp) {
			temp = ['unknown', 'unknown', 'unknown', 'unknown'];
		}

		result = ['', 'anonymous', temp[1], temp[2], temp[3]];
	}

	return {
		name: result[1],
		path: result[2],
		file: result[2].split(libpath.sep).pop(),
		line: result[3],
		char: result[4]
	};
});

/**
 * Get info on the caller: what line this function was called from
 * This is done by creating an error object, which in its turn creates
 * a stack trace string we can manipulate
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.3
 * @version  0.3.4
 *
 * @param   {Integer}   level   Skip x many callers
 *
 * @return  {Object}    An object contain caller info
 */
JanewayClass.setMethod(function getCallerInfo(level, err) {

	var caller_line,
	    stack,
	    copy,
	    key,
	    msg,
	    obj,
	    def,
	    ar,
	    i;

	if (err && err.type === 'callerInfo') {

		// Shallow clone the object
		err = Blast.Bound.Object.assign({}, err);

		if (typeof err.level !== 'undefined') {
			for (key in err.stack[err.level]) {
				err[key] = err.stack[err.level][key];
			}
		}

		return err;
	}

	if (typeof level === 'undefined') level = 0;

	level += 6;

	if (typeof err == 'string') {
		msg = err;
		err = undefined;
	}

	if (!err) {

		def = Error.stackTraceLimit;

		// Set the stacktracelimit, we don't need anything above the wanted level
		Error.stackTraceLimit = 1 + level;

		if (this.config && this.config.caller_info.stack_size > Error.stackTraceLimit) {
			Error.stackTraceLimit = this.config.caller_info.stack_size;
		}

		err = new Error(msg);

		// Now reset the stacktracelimit to its default
		Error.stackTraceLimit = def;
	}

	// Some errors don't have a stack
	stack = err.stack || '';

	// Turn the stack string into an array
	ar = stack.split('\n');

	// Get the caller line
	caller_line = ar[level - 3];

	if (!caller_line) {
		caller_line = ar[ar.length-1];
	}

	obj = this.extractLineInfo(caller_line);
	obj.text = stack;

	obj.stack = [];

	copy = ar.splice(0);

	// Remove the first entry in the array
	copy.shift();

	for (i = 0; i < copy.length; i++) {
		obj.stack.push(this.extractLineInfo(copy[i]));
	}

	obj.err = err;
	obj.message = err.message;
	obj.name = err.name;
	obj.type = 'callerInfo';
	obj.seen = 1;

	return obj;
});

/**
 * Indent text
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.3
 * @version  0.2.5
 *
 * @return  {String}
 */
JanewayClass.setMethod(function indent(text, skipText, skipFirstLine) {

	var lines        = text.split('\n'),
	    visibleCount = stripEsc(skipText).length,
	    hiddenCount  = skipText.length,
	    difference   = hiddenCount - visibleCount,
	    maxWidth,
	    uselength,
	    lineNr,
	    line,
	    length,
	    hiddenLength,
	    visibleLength,
	    result;

	if (typeof skipFirstLine === 'undefined') skipFirstLine = true;
	if (skipFirstLine) {
		skipFirstLine = 1;
	} else {
		skipFirstLine = 0;
	}

	for (i = 0; i < lines.length; i++) {

		if (i == 0 && skipFirstLine){
			maxWidth = this.screen_width + difference;
		} else {
			lines[i] = multiply(' ', visibleCount) + lines[i];
			maxWidth = this.screen_width;
		}

		line = lines[i];

		hiddenLength = line.length;
		visibleLength = stripEsc(line).length;

		if (visibleLength > this.screen_width) {
			lines[i] = line.substring(0, maxWidth) + '\n' + multiply(' ', visibleCount) + line.substring(maxWidth);
		}
	}

	return lines.join('\n');
});

/**
 * Output messages
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.3
 * @version  0.2.5
 *
 * @param    {String}  type
 * @param    {Array}   args
 * @param    {Object}  options
 */
JanewayClass.setMethod(function print(type, args, options) {

	var i,
	    info,
	    level,
	    trace,
	    result,
	    output;

	if (!options) {
		options = {};
	}

	if (typeof options.verbosity == 'undefined') {
		options.verbosity = this.LEVELS.INFO;
	}

	level = options.level || 0;

	if (options.err) {
		level -= 3;
	}

	info = this.getCallerInfo(options.level, options.err);
	options.info = info;
	info.time = new Date();

	if (this.logList) {
		result = this.logList.consoleLog(args, type, options);
	}

	if (!this.logList || this.options.output_to_stdout) {
		trace = esc(90, '[') + type + esc(90, '] ') + esc(90, '[') + esc(1, info.file + ':' + info.line) + esc(90, '] ');
		output = trace;

		if (result) {
			// If result is truthy, a file object was added
			// to the arguments, so we need to skip that
			i = 1;
		} else {
			i = 0;
		}

		for (; i < args.length; i++) {

			if (args[i] && typeof args[i] != 'string') {
				args[i] = util.inspect(args[i], {colors: true});
			}

			output += ' ';

			if (typeof args[i] != 'string') {
				output += util.inspect(args[i], {colors: true});
			} else {
				output += args[i];
			}
		}

		// Remove colours when terminal doesn't support them
		if (!process.env.COLORTERM && !this.options.keep_color) {
			output = stripEsc(output);
		}

		if (this.options.change_indent !== false) {
			try {
				output = this.indent(output, trace);
			} catch (err) {
				outputs.stdout.write(String(err) + '\n');
			}
		}

		outputs.stdout.write(output);
		outputs.stdout.write('\n');
	}

	return result;
});

/**
 * Scroll the main window
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.2.0
 *
 * @param    {Number}  direction
 * @param    {Boolean} force_render   Set to true to render immediately
 */
JanewayClass.setMethod(function scroll(direction, force_render) {

	var before,
	    after;

	if (direction == null) {
		direction = 1;
	}

	before = this.logList.box.getScrollPerc();
	this.logList.box.scroll(direction);
	after = this.logList.box.getScrollPerc();

	// Undo scroll if nothing changed
	if (before == 0 && after == 0) {
		this.logList.box.scroll(0 - direction);
	}

	if (force_render) {
		this.logList.render();
	}
});

/**
 * Keep the newest line in screen, unless the user has scrolled away
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.4
 * @version  0.1.4
 *
 * @param    {Boolean}   or_render   If scroll_down is false, render the box at least (true)
 */
JanewayClass.setMethod(function scrollAlong(or_render) {
	if (this.scroll_down) {

		if (!this.scrolled_manually) {
			this.scroll(1);
		}

		this.logList.render();
	} else if (or_render !== false) {
		this.logList.render();
	}
});

/**
 * Show a popup
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.5
 * @version  0.2.3
 *
 * @param    {String}   id       The unique id (only 1 can be open at a time)
 * @param    {Object}   options
 *
 * @return   {ListBox}
 */
JanewayClass.setMethod(function popup(id, options) {

	var list;

	if (!options) {
		if (this.open_popups[id]) {
			this.open_popups[id].destroy();
		}

		this.screen.render();
		return;
	}

	if (!options.position) {
		options.position = {};
	}

	if (options.position.bottom == null) {
		options.position.bottom = 2 + this.config.status.height;
	}

	if (options.position.height == null) {
		options.position.height = 6;
	}

	if (this.open_popups[id]) {
		this.open_popups[id].destroy();
	}

	if (options.items.length) {
		options.position.height += 1;
		options.items = ['', ...options.items]
	}


	if (!options.items.length) return

	// Create a new list
	list = this.blessed.list({
		//bottom: 2,
		position: options.position,
		items: options.items,
		mouse: true, // Allow selecting items with the mouse
		scrollbar: this.config.popup.scrollbar,
		border: this.config.popup.border,
		shadow: this.config.popup.shadow,
		style: this.config.popup.style
	});

	// Store the popup under its unique id
	this.open_popups[id] = list;

	// Add it to the screen
	this.screen.append(list);

	// Make sure it's in the front
	list.setFront();

	// Render the screen
	this.screen.render();

	return list;
});

/**
 * Get the property names of the given object,
 * follow the prototype chain
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.0
 * @version  0.2.0
 *
 * @param    {Object}    target
 *
 * @return   {Array}
 */
JanewayClass.setMethod(function getPropertyNames(target) {

	var proto,
	    result;

	// Get the descriptor
	result = Object.getOwnPropertyNames(target);

	// Config wasn't found, look up the prototype chain
	if (typeof target == 'function') {
		proto = target.prototype;
	} else {
		proto = Object.getPrototypeOf(target);
	}

	if (proto) {
		return result.concat(getPropertyNames(proto));
	}

	return result;
});

/**
 * Show the autocomplete
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.5
 * @version  0.2.3
 *
 * @param    {String}   cmd   The current content of the CLI
 * @param    {Object}   key   The last key pressed
 */
JanewayClass.setMethod(function autocomplete(cmd, key) {

	var pieces,
	    target,
	    hidden,
	    width,
	    items,
	    item,
	    last,
	    left,
	    list,
	    keys,
	    key,
	    i;

	if (this.config.autocomplete.enabled === false) {
		return;
	}

	if (!cmd || !key) {
		this.autocomplete_list = this.popup('autocomplete', false);
		this.screen.render();
		return;
	}

	this.autocomplete_prefix = null;
	pieces = cmd.split('.');
	items = [];
	left = 1 + cmd.length;

	if (pieces.length == 1) {
		target = vm_context;
		last = cmd;
	} else {
		last = pieces.pop();
		target = Blast.Bound.Object.path(vm_context, pieces);

		this.autocomplete_prefix = pieces.join('.') + '.';
	}

	if (target) {

		// First: get its own keys
		keys = Object.keys(target);

		// Now get all the hidden ones
		hidden = Blast.Bound.Array.subtract(this.getPropertyNames(target), keys);

		for (i = 0; i < keys.length; i++) {
			item = keys[i];

			if (!last || Blast.Bound.String.startsWith(item, last)) {
				items.push(item);
			}
		}

		for (i = 0; i < hidden.length; i++) {
			item = hidden[i];

			if (!last || Blast.Bound.String.startsWith(item, last)) {
				items.push(item);
			}
		}
	}

	width = 0;

	for (i = 0; i < items.length; i++) {
		if (items[i] && items[i].length > width) {
			width = items[i].length;
		}
	}

	if (cmd.trim() && items.length) {
		list = this.popup('autocomplete', {
			position: {
				left   : left,
				height : Math.min(this.config.autocomplete.height, items.length + 2),
				width  : width + 4
			},
			items : items
		});
	} else {
		list = this.popup('autocomplete', false);
	}

	this.autocomplete_list = list;
});

/**
 * Get the user config
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.3
 * @version  0.3.4
 */
JanewayClass.setMethod(function _getUserConfig() {

	var conf_path,
	    history,
	    config,
	    files = ['janeway.js', 'janeway.json'],
	    i;

	// Generate the path to the janeway folder
	this.user_janeway_path = libpath.resolve(os.homedir(), '.janeway');

	for (i = 0; i < files.length; i++) {

		// Generate the path to the user config
		conf_path = libpath.resolve(this.user_janeway_path, files[i]);

		try {
			config = require(conf_path);
			break;
		} catch (err) {
			config = {};
		}
	}

	if (config == null || typeof config != 'object') {
		config = {};
	}

	config = Blast.Bound.Object.merge({}, this.default_config, config);

	if (config.cli_history.save) {

		// Make sure the janeway path exists
		try {
			fs.mkdirSync(this.user_janeway_path);
		} catch (err) {
			// Ignore
		}
	}

	return config;
});

/**
 * Save the cli history, if enabled
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.3
 * @version  0.2.5
 */
JanewayClass.setMethod(function saveCliHistory() {

	var data;

	if (!this.config.cli_history.save) {
		return;
	}

	if (this.config.cli_history.save < 0) {
		this.config.cli_history.save = 9999;
	}

	data = this.cli_history.slice(0, this.config.cli_history.save);

	try {
		fs.writeFile(this.history_path, JSON.stringify(data, null, 2), Blast.Collection.Function.thrower);
	} catch (err) {
		// Ignore
	}
});

/**
 * Create a blessed screen
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.5
 * @version  0.2.5
 *
 * @param    {Object}     options
 */
JanewayClass.setMethod(function createScreen(options) {

	var screen,
	    def;

	if (!this.config) {
		this.config = this._getUserConfig();
	}

	if (this.config.blessed && this.config.blessed.screen) {
		def = this.config.blessed.screen;
	}

	// Add screen default options
	options = Blast.Bound.Object.assign({}, def, options);

	// Create the screen
	screen = blessed.screen(options);

	return screen;
});

/**
 * Start Janeway
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.2.5
 *
 * @param    {Object}     options
 * @param    {Function}   callback
 */
JanewayClass.setMethod(function start(options, callback) {

	var that = this,
	    status_height,
	    scrolledUp = false,
	    vm_options,
	    listeners,
	    logList,
	    bottom,
	    output,
	    screen,
	    status,
	    menu,
	    form,
	    cli,
	    to;

	if (typeof options == 'function') {
		callback = options;
		options = {};
	}

	if (typeof callback != 'function') {
		callback = null;
	}

	if (!options) {
		options = {};
	}

	// If a screen is already given, render to that
	if (options.screen) {
		screen = options.screen;
	}

	// Store the options
	this.options = options;

	// When no screen is given, only start once!
	if (screen == null && (started || starting)) {
		if (callback) {
			that.afterOnce('ready', callback);
		}

		return;
	}

	starting = true;

	// If no screen is given and it's not a TTY process,
	// then don't start janeway because it's not possible
	if (screen == null && !process.stdout.isTTY) {

		if (callback) {
			callback(new Error('Could not start Janeway, not a valid TTY terminal'));
		}

		return console.error('Could not start Janeway, not a valid TTY terminal');
	}

	// Get the program isntance
	this.program = blessed.program();

	// Get the user configuration
	this.config = this._getUserConfig();

	// Listen for uncaught exceptions and print them out
	// This prevents exceptions from "disappearing" if they where
	// emitted while Janeway was starting
	if (this.catch_exceptions) {

		// See if there already is an exception listener
		// (BTW: blessed will also add one, later)
		listeners = process.listeners('uncaughtException');

		// If there already is a listener, don't add ours
		// It wouldn't do anything, anyway
		if (listeners.length == 0) {
			process.on('uncaughtException', function onException(err) {

				// If another listener was added since,
				// (excluding the one added by blessed)
				// let it handle this error
				if (process.listeners('uncaughtException').length > 2) {
					return;
				}

				// Re-emit the exceptions on the Janeway instance
				if (that.re_emit_exceptions) {
					that.emit('uncaughtException', err);
				}

				// Throw the error again, node will shutdown
				// even if other uncaughtException listeners exist
				if (that.shutdown_on_exception) {

					// Do some janeway specific cleaning up
					exitHandler();

					throw err;
				} else {
					that.print('error', ['Uncaught exception:', err], {err: err})
				}
			});
		}

		// See if there already is a rejection listener
		listeners = process.listeners('unhandledRejection');

		if (listeners.length == 0) {
			process.on('unhandledRejection', function onRejection(err) {

				// If another listener was added since,
				// (excluding the one added by blessed)
				// let it handle this error
				if (process.listeners('unhandledRejection').length > 2) {
					return;
				}

				// Re-emit the exceptions on the Janeway instance
				if (that.re_emit_exceptions) {
					that.emit('unhandledRejection', err);
				}

				// Throw the error again, node will shutdown
				// even if other unhandledRejection listeners exist
				if (that.shutdown_on_exception) {

					// Do some janeway specific cleaning up
					exitHandler();

					throw err;
				} else {
					that.print('error', ['Unhandled rejection:', err], {err: err})
				}
			});
		}
	}

	if (!Blast.isNW) {
		// Require the custom textarea widget
		Editarea = require('./class/editarea');

		if (screen == null) {
			screen = this.createScreen({
				output : outputs.stdout,
				error  : outputs.stderr
			});
		}

		if (!this.main_screen) {
			this.main_screen = screen;
		}

		if (options.width) {
			screen.width = options.width;
		}

		if (options.height) {
			screen.height = options.height;
		}

		if (this.config.status.enabled) {
			status_height = this.config.status.height || 1;
		} else {
			status_height = 0;
			this.config.status.height = 0;
		}

		// Create the interface boxes
		bottom = blessed.box({
			bottom: 0 + status_height,
			width: '100%',
			content: '▶',
			height: 2,
			style: this.config.cli.style
		});

		form = blessed.form({
			width: '100%',
			left: 2,
			content: 'FORM',
			style: this.config.cli.style
		});

		menu = blessed.listbar({
			top    : 0,
			left   : 0,
			width  : '100%',
			height : 1,
			mouse  : true,
			style  : this.config.menu.style
		});

		status = blessed.box({
			bottom : 0,
			width  : '100%',
			height : status_height,
			tags   : true,
			style  : this.config.status.style
		});

		output = blessed.box({
			top: 1,
			bottom: (2 + status_height),
			left: 0,
			width: '100%',
			height: screen.height - (3 + status_height),
			scrollable: true,
			alwaysScroll: true, // Don't turn this off, or it breaks
			content: '',
			wrap: false,
			scrollbar: this.config.output.scrollbar,
			style: this.config.output.style
		});

		cli = Editarea({
			width: '100%',
			left: 0,
			bottom: 0,
			top: 0,
			style: this.config.cli.style,
			//inputOnFocus: true,
			mouse: true
		});

		// Store elements in the object
		this.blessed = blessed;
		this.screen = screen;
		this.output = output;
		this.bottom = bottom;
		this.status = status;
		this.form = form;
		this.menu = menu;
		this.cli = cli;

		// Create the LogList instance
		logList = new Janeway.LogList(this, screen, output);
		this.logList = logList;
	}

	/**
	 * Keep a reference to the original `console.log`
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console._log = console.log;

	/**
	 * Hijack console.log
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	console.log = function log() {
		that.print('info', arguments, {level: 1});
	};

	/**
	 * Hijack console.dir
	 * (Currently the same as log)
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console.dir = function dir() {
		that.print('dir', Blast.Bound.Array.cast(arguments), {level: 1});
	};

	/**
	 * Hijack console.info
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console.info = function info() {
		that.print('info', Blast.Bound.Array.cast(arguments), {level: 1});
	};

	/**
	 * Hijack console.warn
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console.warn = function warn() {
		that.print('warn', Blast.Bound.Array.cast(arguments), {level: 1});
	};

	/**
	 * Hijack console.error
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	console.error = function error() {
		that.print('error', Blast.Bound.Array.cast(arguments), {level: 1});
	};

	if (Blast.isNW) {

		if (callback) {
			callback(new Error('Janeway does not work under nw.js'));
		}

		return;
	}

	// Prepare to hijack stdout & stderr `write` functions
	to = {
		stdout: process.stdout.write,
		stderr: process.stderr.write
	};

	/**
	 * Hijack stderr output
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	process.stderr.write = function stderrWrite(string, encoding, fd) {
		that.print('error', [''+string]);
	};

	/**
	 * Hijack stdout output
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 */
	process.stdout.write = function stdoutWrite(string, encoding, fd) {
		that.print('info', [''+string]);
	};

	/**
	 * Listen for resize events
	 * (The `screen` should also emit a resize event, but it never does)
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.3
	 * @version  0.3.3
	 */
	process.stdout.on('resize', function onResize() {
		that.screen_width = process.stdout.columns;
		that.screen_height = process.stdout.rows;
	});

	/**
	 * Handle mouse events (scrolling)
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.4
	 */
	output.on('mouse', function onMouse(e) {

		var scrolled = false;

		if (e.action == 'wheelup') {
			output.scroll(-5);
			scrolledUp = true;
			scrolled = true;
		} else if (e.action == 'wheeldown') {
			output.scroll(5);
			scrolledUp = false;
			scrolled = true;
		}

		if (scrolled) {
			that.scrolled_manually = true;

			if (output.getScrollPerc() == 100) {
				that.scrolled_manually = false;
			}

			logList.render();
		}
	});

	/**
	 * Handle mouse clicks
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.0
	 */
	output.on('click', function onClick(data) {

		var line_index,
		    scroll;

		scroll = that.logList.box.childBase;
		line_index = scroll + data.y - 1;

		logList.click(line_index, data.x, data.y);
	});

	/**
	 * Handle mouse down events
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 */
	output.on('mousedown', function onMouseDown(data) {

		var line_index,
		    scroll;

		scroll = that.logList.box.childBase;
		line_index = scroll + data.y - 1;

		// If we're already pressing down,
		// mousemove won't fire, but this will!
		if (that.mouse_down) {

			// So emit a mousemove event first
			logList.mouseMove(line_index, data.x, data.y);

			start = that.mouse_down_start;
			end = {
				line_index : line_index,
				x          : data.x,
				y          : data.y
			};

			// See if we need to reverse the elements
			if (end.y < start.y) {
				start = end;
				end = that.mouse_down_start;
			} else if (end.y == start.y && end.x < start.x) {
				start = end;
				end = that.mouse_down_start;
			}

			logList.mouseDrag(that.mouse_down_start, end);

			return;
		}

		// Indicate the mouse is down
		that.mouse_down = true;

		// Remember where the mousedown event started
		that.mouse_down_start = {
			line_index : line_index,
			x          : data.x,
			y          : data.y
		};

		logList.mouseDown(line_index, data.x, data.y);
	});

	/**
	 * Handle mousemove events
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 */
	output.on('mousemove', function onMouseMove(data) {

		var line_index,
		    scroll,
		    start,
		    end;

		scroll = that.logList.box.childBase;
		line_index = scroll + data.y - 1;

		logList.mouseMove(line_index, data.x, data.y);
	});

	/**
	 * Handle mouse up events
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 */
	output.on('mouseup', function onMouseUp(data) {

		var line_index,
		    scroll;

		// The mouse is no longer down
		that.mouse_down = false;
		that.mouse_down_start = null;

		scroll = that.logList.box.childBase;
		line_index = scroll + data.y - 1;

		logList.mouseUp(line_index, data.x, data.y);
	});

	/**
	 * Enter the currently selected value in the autocomplete list into the CLI
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.5
	 * @version  0.2.0
	 */
	function selectAutocomplete(pickFirstIfNoneSelected = false) {
		var temp,
		    path;

		var selected = that.autocomplete_list.selected

		if (selected === 0 && pickFirstIfNoneSelected) {
			selected++;
		}

		// Get the selected item
		temp = that.autocomplete_list.getItem(selected);

		// Get the path before the last dot
		path = that.autocomplete_prefix || '';

		if (!temp) return false;
		if (!temp.content) return false;

		var final = path + temp.content;

		// Set the value and move to the end
		cli.setValue(final, true);
		that.autocomplete();

		return true;
	}

	function deleteWord(cmd) {
		var wordRegex = /\w+\s*$/
		var matches = cmd.match(wordRegex)
		if (matches && matches.length && matches[0]) {
			return cmd.replace(wordRegex, '')
		}

		return cmd.slice(0, -1);
	}

	var current_keypress_time = 0,
	    last_keypress_time = 0,
	    current_key = null,
	    last_key = null;

	/**
	 * Handle input of the CLI
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.2.5
	 */
	cli.on('keypress', function onKeypress(e, key) {
		var key_speed,
		    temp,
		    dir,
		    cmd,
		    id;

		// Set the last keypress time to the old value of the "current" one
		last_keypress_time = current_keypress_time;
		last_key = current_key;

		// Get the time of the current keypress
		current_keypress_time = Date.now();
		current_key = key.name;

		// Calculate the key speed
		key_speed = current_keypress_time - last_keypress_time;

		// Enters appear as an "enter" first and a "return" afterwards,
		// ignore those second returns
		if (key.name == 'return' && last_key == 'enter') {
			cli.setValue(cli.getValue().replace(/\n$/, ''), true);
			that.autocomplete();
			return;
		}

		if (key.name == 'pagedown') {
			that.scroll(20, true);
		} else if (key.name == 'pageup') {
			that.scroll(-20, true);
		} else if (key.name == 'enter' && key_speed > 24) {
			cmd = cli.getValue().trim();

			if (that.autocomplete_list) {
				if (selectAutocomplete()) {
					return;
				}
			}

			// Reset the index
			that.cli_history_index = -1;

			// Clear out the stash
			that.cli_stash = '';

			// Clear the CLI anyway, we don't want returns in the input
			// but it still happens, this way it'll limit to 1 return
			cli.clearValue();

			// Return if the cmd is empty
			if (!cmd) {
				return;
			}

			// If the new command differs from the last one, unshift it onto the array
			if (cmd != that.cli_history[0]) {
				that.cli_history.unshift(cmd);
				that.saveCliHistory();
			}

			if (cmd == 'cls') {
				logList.clearScreen();

				setImmediate(function() {

					// Unselect currently selected line
					if (that.config.cli.unselect_on_return) {
						that.unselect();
					}

					// Clear cli
					cli.clearValue();
					cli.render();
				});
				return;
			} else if (cmd == 'exit') {
				process.exit();
			}

			that.evaluate(cmd);
		} else {
			if (key.ch === '.') {
				if (that.autocomplete_list) {
					selectAutocomplete();
				}
			}

			if (key.name == 'tab') {
				if (that.autocomplete_list) {
					selectAutocomplete(true);
				}

				cli.setValue(cmd, true);
				this.autocomplete(cmd, key);
				return;
			}

			cmd = cli.getValue();

			if (key.code || key.name == 'escape') {
				// Ignore keys with codes

				// If the autocomplete list is open, listen to the arrow keys
				if (that.autocomplete_list) {
					if (key.name == 'up') {
						that.autocomplete_list.up(1);
						that.autocomplete_list.render();
					} else if (key.name == 'down') {
						that.autocomplete_list.down(1);
					} else if (key.name == 'escape') {
						that.autocomplete();
					}

					screen.render();
				} else {

					// If the autocomplete popup is not open,
					// arrow keys should cycle through the CLI history
					if (key.name == 'up') {
						dir = 1;
					} else if (key.name == 'down') {
						dir = -1;
					}

					if (dir) {

						// If the current index is -1, stash the current input
						if (that.cli_history_index == -1 && cmd) {
							that.cli_stash = cmd;
						}

						id = that.cli_history_index + dir;

						if (id == -1) {
							that.cli_history_index = -1;
							cli.setValue(that.cli_stash, true);
						} else if (that.cli_history[id] != null) {

							// Get the history entry
							temp = that.cli_history[id];

							// Set the new index
							that.cli_history_index = id;

							// Set the value in the cli
							cli.setValue(temp, true);
						}

						screen.render();
					}
				}

				return;
			} else if (key.full === 'C-w') { // Option + Backspace
				cmd = deleteWord(cmd)
				cli.setValue(cmd, true);
				screen.render()
			} else if (key.name === 'backspace') {
				cmd = cmd.slice(0, -1);
			} else {
				cmd += e;
			}

			that.autocomplete(cmd, key);
		}
	});

	// Prepare the screen contents and render
	screen.append(bottom);
	screen.append(menu);
	screen.append(output);

	if (status_height) {
		screen.append(status);
	}

	bottom.append(form);
	form.append(cli);

	// Quit on a shortcut (Control-C by default)
	cli.key(that.config.shortcuts.exit || ['C-c'], function exitNow(ch, key) {
		return process.exit(0);
	});

	// The CLI is always in focus
	cli.readInput(function recurse(result) {
		cli.readInput(recurse);
	});

	/**
	 * Cleanup on exit
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.2.5
	 */
	function exitHandler(err) {

		// Unset the title
		if (that._title_has_been_set) {
			that.setTitle(false);
		}

		// Destroy the screen
		screen.destroy();
	}

	// Do something when app is closing
	process.on('exit', exitHandler);

	// Catch Ctrl+c
	process.on('SIGINT', exitHandler);

	/**
	 * Listen to the next screen render event,
	 * only then will things be visible on the screen
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.5
	 */
	screen.once('render', function onRender() {
		that.emitOnce('ready');

		if (callback) {
			callback();
		}
	});

	// Create the main menu
	this._createMenu();

	// Create the indicator area
	this._createIndicatorArea();

	screen.render();
});

/**
 * Create the menu
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.0
 * @version  0.3.0
 */
JanewayClass.setMethod(function _createMenu() {

	var that = this,
	    button_copy;

	button_copy = blessed.box({
		parent    : this.menu,
		mouse     : true,
		autoFocus : false,
		name      : 'copy',
		content   : 'Copy JSON',
		shrink    : true,
		padding   : {
			left  : 1,
			right : 1
		},
		style     : this.config.menu.button
	});

	// Listen to button clicks, and copy the selection
	button_copy.on('click', function pressedCopy(data) {

		var selection = that.logList.current_selection,
		    line = that.logList.current_selected_line,
		    json,
		    temp;

		// See if the line has an implementation for getting the clipboard value
		if (line && line.getValueForClipboard) {
			temp = line.getValueForClipboard(selection);

			if (typeof temp !== 'undefined') {
				selection = temp;
			}
		}

		if (typeof selection == 'function') {
			json = selection + '';
		} else {
			try {
				json = Blast.Bound.JSON.dry(selection, null, 2);
			} catch (err) {
				// Ignore
			}
		}

		if (json) {
			ncp.copy(json, function copied(err) {
				if (err) {
					console.log('Error copying to clipboard:', err);
				}
			});
		}
	});
});

/**
 * Create the indicator area
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.1
 * @version  0.2.3
 */
JanewayClass.setMethod(function _createIndicatorArea() {

	var that = this,
	    area;

	area = blessed.box({
		parent      : this.menu,
		top         : 0,
		right       : 0,
		height      : 1,
		shrink      : true,
		mouse       : true,
		orientation : 'horizontal',
		style       : this.config.menu.style
	});

	// All indicators
	area.indicators = [];
	area.indicators_by_name = {};

	this.indicator_area = area;
});

/**
 * Render indicator area
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.1
 * @version  0.2.1
 */
JanewayClass.setMethod(function _renderIndicatorArea() {

	var indicator,
	    right,
	    i;

	// Sort the indicators
	Blast.Bound.Array.sortByPath(this.indicator_area.indicators, 'weight', 'creation_number');

	// Get the most right position
	right = 0;

	for (i = 0; i < this.indicator_area.indicators.length; i++) {
		indicator = this.indicator_area.indicators[i];

		indicator.box.position.right = right;
		right += indicator.width;
	}

	this._initLeftHover();
});

/**
 * Set left hover text:
 * hovertext that hovers to the left in stead of right
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.1
 * @version  0.2.1
 */
JanewayClass.setMethod(function _initLeftHover() {

	var that = this;

	if (this._hoverText) {
		return;
	}

	let current_hover,
	    current_indicator;

	this._hoverText = new blessed.box({
		screen: this.screen,
		right: 0,
		top: 0,
		tags: false,
		height: 'shrink',
		width: 'shrink',
		border: 'line',
		style: this.config.indicator.style
	});

	this.screen.on('element mouseover', function onMouseOver(el, data) {

		let indicator = that.getIndicatorInstance(el);

		if (!indicator) {
			if (current_indicator) {
				current_indicator.onMouseOut(el, data);
			}

			return;
		}

		if (current_indicator && indicator != current_indicator) {
			current_indicator.onMouseOut(el, data);
		}

		current_hover = el;
		current_indicator = indicator;

		indicator.onMouseOver(el, data);
	});

	// XXX This can cause problems if the
	// terminal does not support allMotion.
	// Workaround: check to see if content is set.
	this.screen.on('element mouseup', function(el) {
		if (!that._hoverText.getContent()) return;
		if (!el._hoverLeftOptions) return;
		that.screen.append(that._hoverText);
		that.screen.render();
	});
});

/**
 * Unselect the line that is currently selected
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.3
 * @version  0.2.3
 */
JanewayClass.setMethod(function unselect() {
	if (this.logList.selectedLine) {
		this.logList.selectedLine.unselect();
	}
});

/**
 * Get the closest janeway indicator instance
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.3.4
 * @version  0.3.4
 *
 * @param    {Node}   element
 *
 * @return   {Indicator}
 */
JanewayClass.setMethod(function getIndicatorInstance(element) {

	do {

		if (element._janeway_indicator) {
			return element._janeway_indicator;
		}

		element = element.parent;

	} while(element)

});

/**
 * See if the elements are related
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.3.4
 * @version  0.3.4
 */
JanewayClass.setMethod(function isElementChild(child, parent) {

	while (child.parent) {
		if (child.parent == parent) {
			return true;
		}

		child = child.parent;
	}

	return false;
});

/**
 * Evaluate code
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.3.5
 * @version  0.3.5
 */
JanewayClass.setMethod(async function evaluate(source) {

	let logList = this.logList;

	// Create a line for the input command
	let commandLine = new Janeway.CommandLogLine(logList);
	commandLine.set(esc('38;5;74', source));

	// Add it to the logList
	logList.pushLine(commandLine);

	try {
		let expect_promise = false,
		    result,
		    code;

		if (/\bawait\b/.test(source)) {
			code = '(async function() { return (' + source + ')}())';
			expect_promise = true;
		} else {
			code = source;
		}

		let vm_options = {
			filename : 'CLI'
		};

		// Run the command in the custom context
		try {
			// Force it to become an expression first
			result = vm.runInNewContext('(' + code + ')', vm_context, vm_options);
		} catch (err) {
			// In case it failed, try without parentheses
			result = vm.runInNewContext(code, vm_context, vm_options);
		}

		// Create a line for the output
		let evalLine = new Janeway.EvalOutputLogLine(logList);

		if (expect_promise) {
			evalLine.set([esc('38;5;240', 'Awaiting promise...')]);
		} else {
			evalLine.set([result]);
		}

		logList.insertAfter(evalLine, commandLine.index);

		if (expect_promise) {
			result = await result;
			evalLine.set([result]);
			evalLine.render();
		}

	} catch (err) {
		let errorLine = new Janeway.ErrorLogLine(logList);
		errorLine.set([err]);

		logList.insertAfter(errorLine, commandLine.index);
	}

	// Even though the input has been cleared,
	// the return gets added afterwards
	// So we need to make sure that happens
	await Blast.Classes.Pledge.after(1);

	// Unselect currently selected line
	if (this.config.cli.unselect_on_return) {
		this.unselect();
	}

	// Clear cli
	this.cli.clearValue();
	this.cli.render();

	// Scroll along if needed
	this.scrollAlong();
});

Janeway = new JanewayClass();

// Require all the classes
require('./class/log_list.js')(Janeway, Blast, Blast.Bound);
require('./class/log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/args_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/property_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/string_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/hex_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/paging_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/other_log_line.js')(Janeway, Blast, Blast.Bound);
require('./class/status.js')(Janeway, Blast, Blast.Bound);
require('./class/indicator.js')(Janeway, Blast, Blast.Bound);
require('./spinners.js')(Janeway, Blast, Blast.Bound);

// Expose janeway as a global
global.__Janeway = Janeway;

module.exports = Janeway;
