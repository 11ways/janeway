var util = require('util');

module.exports = function defineLogLine(Janeway, Blast, Bound) {

	let JanewayClass = Blast.Classes.Develry.Janeway.Janeway,
	    stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function,
	    N = Bound.Number,
	    S = Bound.String,
	    KEY = Symbol('key');

	/**
	 * A generic line of text in the log list output
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var ArgsLogLine = Janeway.LogLine.extend(function ArgsLogLine(logList) {

		ArgsLogLine.super.call(this, logList);

		// The arguments to print out
		this.args = null;

		// A map of the (simple) line to their argument number
		this.simpleMap = [];

		// A map of the args to their string values, set at init
		this.argStringMap = [];

		// The individual object representation of this line
		this.structure = [];

		// The pagination object
		this.pagination = {};
	});

	/**
	 * Set the fileinfo
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.4
	 * @version  0.1.4
	 *
	 * @param    {Object}   info
	 */
	ArgsLogLine.setMethod(function setFileinfo(info) {

		if (typeof info == 'string') {
			this.colouredFileinfo = ' ' + info;
			this.fileinfo = stripEsc(this.colouredFileinfo);
		} else {
			this.fileObject = info;
		}
	});

	/**
	 * Set the arguments for this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.4
	 *
	 * @param    {Array}   args   An array of variables
	 */
	ArgsLogLine.setMethod(function set(args) {

		if (this.fileObject) {
			Array.prototype.unshift.call(args, this.fileObject);
		}

		this.args = args;
		this.dissect();
	});

	/**
	 * Compare new arguments to this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.3.4
	 */
	ArgsLogLine.setMethod(function compare(args, type, options) {

		var i,
		    j;

		if (this.fileObject) {
			i = 1;
			j = 0;
		} else {
			i = 0;
			j = -1;
		}

		// Args can only be the same if the have the same length
		// A file object is added to the args line afterwards, so subtract that
		if (this.args.length != (args.length + i)) {
			return 0;
		}

		// Ignore the first argument, it's the error object
		for (i = 0; i < args.length; i++) {
			j++;

			// Do a strict check
			if (args[i] !== this.args[j]) {
				return false;
			}

			// Check the types of the arguments
			if (typeof args[i] != typeof this.args[j]) {
				return false;
			}

			// Objects need a more expensive compare, but this is disabled by default
			if (!this.janeway.config.properties.alike_objects) {
				return false;
			} else if (!Blast.Bound.Object.alike(args[i], this.args[j])) {
				// For object types we need to do a more expensive compare
				return false;
			}
		}

		// If we got this far the 2 lines were the same
		return true;
	});

	/**
	 * Get the class identifier to use for the given argument.
	 * (Left side of the representation, in yellow)
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.4.3
	 * @version  0.4.3
	 */
	ArgsLogLine.setMethod(function getArgumentLeftSide(arg) {

		let result;

		try {
			if (typeof arg[JanewayClass.ARG_LEFT] == 'function') {
				result = arg[JanewayClass.ARG_LEFT]();
			}
		} catch (err) {
			// Ignore
		}

		if (result == null) {
			try {
				result = this.getInstanceIdentifier(arg);
			} catch (err) {
				// Ignore
			}
		}

		return result;
	});

	/**
	 * Get the instance info to use for the given argument.
	 * (Right side of the representation, in white)
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.4.3
	 * @version  0.4.3
	 */
	ArgsLogLine.setMethod(function getArgumentRightSide(arg, do_fallback = true) {

		let result;

		try {
			if (typeof arg[JanewayClass.ARG_RIGHT] == 'function') {
				result = arg[JanewayClass.ARG_RIGHT]();
			}
		} catch (err) {
			// Ignore
		}

		if (result == null) {
			try {
				if (typeof arg == 'function') {
					result = arg.name || 'anonymous';

					if (arg.namespace) {
						result = arg.namespace + '.' + result;
					}

				} else if (arg.constructor?.name == 'Date' && arg.getUTCDate) {
					result = Blast.Bound.Date.format(arg, this.janeway.config.properties.date_format);
				} else if (do_fallback) {

					let length;

					try {
						length = arg.length;
					} catch (err) {
						// Ignore
					}

					if (length == null) {
						length = arg.size;
					}

					if (typeof length != 'number') {

						if (Object.isPlainObject(arg)) {
							length = Object.keys(arg).length;
						} else {
							length = null;
						}
					}

					result = length;
				}
			} catch (err) {
				// Ignore
			}
		}

		return result;
	});

	/**
	 * Get the identifier of the instance
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.4
	 * @version  0.4.3
	 */
	ArgsLogLine.setMethod(function getInstanceIdentifier(arg) {

		if (!arg) {
			return ''+arg;
		}

		let result;

		if (Blast.Bound.Object.getPropertyDescriptor(arg, Symbol.toStringTag)) {
			result = arg[Symbol.toStringTag];
		}

		if (!result) {
			if (arg.constructor?.name) {
				result = arg.constructor.name;

				// Add the namespace property, too
				if (arg.constructor.namespace) {
					result = arg.constructor.namespace + '.' + result;
				}
			}
		}

		if (!result) {
			result = 'Object';
		}

		return result;
	});

	/**
	 * Get inline inspect of an object
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.4
	 * @version  0.4.3
	 */
	ArgsLogLine.setMethod(function getInlineInspect(arg, amount) {

		if (!arg) {
			return ''+arg;
		}

		if (!amount) {
			amount = 5;
		}

		let is_array = Array.isArray(arg),
		    result = '',
		    keys;

		if (is_array) {
			result = '[';
			keys = arg;
		} else {

			let right_side = this.getArgumentRightSide(arg, false);

			if (right_side != null) {
				return '{' + right_side + '}';
			}

			result = '{';

			if (arg.constructor.name == 'Date' && arg.getUTCDate) {
				result += Blast.Bound.Date.format(arg, this.janeway.config.properties.date_format);
				result += '}';
				return result;
			}

			keys = Object.keys(arg);

			if (this.janeway.config.properties.sort) {
				keys.sort();
			}
		}

		let key,
		    i;

		for (i = 0; i < keys.length; i++) {
			if (i > 0) {
				result += ', ';
			}

			if (i >= amount) {
				result += this.janeway.config.strings.ellipsis;
				break;
			}

			if (is_array) {
				key = i;
			} else {
				key = keys[i];
			}

			result += key + ': ';

			if (arg[key] && typeof arg[key] == 'object') {
				result += this.getInstanceIdentifier(arg[key]);
			} else {
				result += util.inspect(arg[key]);
			}
		}

		if (is_array) {
			result += ']';
		} else {
			result += '}';
		}

		return result;
	});

	/**
	 * Dissect the given args,
	 * called after #set()
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.4.4
	 */
	ArgsLogLine.setMethod(function dissect() {

		// Reset the maps
		this.simpleMap.length = 0;
		this.argStringMap.length = 0;

		let name_to_show,
		    has_progress,
		    plain,
		    start,
		    temp,
		    type,
		    len,
		    end,
		    str,
		    arg,
		    i;

		for (i = 0; i < this.args.length; i++) {
			arg = this.args[i];
			type = typeof arg;

			if (type == 'string') {
				// Strip all escape sequences for the plain string
				plain = stripEsc(arg);
				str = esc(39, arg);
			} else if (type == 'number') {
				plain = String(arg);
				str = esc(36, plain);
			} else if (type == 'bigint') {
				plain = String(arg + 'n');
				str = esc(36, plain);
			} else if (type == 'boolean') {
				plain = String(arg);
				str = esc(35, plain);
			} else if (arg && type === 'object' || type == 'function') {

				if (arg.type == 'callerInfo') {

					if (this.janeway.args_name_map != null) {
						name_to_show = this.janeway.args_name_map[arg.path] || this.logList.janeway.args_name_map[arg.file];
					}

					if (!name_to_show) {
						name_to_show = arg.file.replace(/\.js$/, '').trim();
					}

					if (this.janeway.config.caller_info.max_filename_length) {
						if (this.strlen(name_to_show) > this.janeway.config.caller_info.max_filename_length) {
							name_to_show = S.truncate(name_to_show, this.janeway.config.caller_info.max_filename_length, false, this.janeway.config.strings.ellipsis);
						}
					}

					len = this.strlen(this.gutter) || 0;

					// Get the time string
					temp = N.toPaddedString(arg.time.getHours(), 2) + ':' + N.toPaddedString(arg.time.getMinutes(), 2) + ':' + N.toPaddedString(arg.time.getSeconds(), 2);
					len += temp.length;

					str = esc(1, temp);

					// Get the identifier
					temp = name_to_show + ':' + arg.line;
					len += temp.length + 2; // +2 for the brackets

					str += ' ' + esc('1;90', '[', 21) + esc('1;30;97', temp, '39') + esc('1;90', ']', 21);

					if (arg.seen > 1) {
						temp = ' (' + arg.seen + ')';
						len += this.strlen(temp);

						str += ' (' + esc('1;30;226', arg.seen, '39') + esc('1;90', ')', 21);
					}

					if (this.janeway.config.caller_info.min_length > 0 && this.janeway.config.caller_info.min_length < 41) {
						if (len < this.janeway.config.caller_info.min_length) {
							temp = this.janeway.config.caller_info.min_length - len;
							str += Bound.String.multiply(' ', temp);
						}
					}

					plain = stripEsc(str);
				} else {

					has_progress = false;

					let left_side = this.getArgumentLeftSide(arg);

					if (left_side !== 'Object' && typeof arg.reportProgress == 'function') {
						has_progress = true;
					}

					if (has_progress) {
						let that = this,
						    instance = arg,
						    index = i,
						    name  = left_side;

						// Some classes (like Protoblast's Pledge) require the
						// `report_progress` property to be set to true.
						instance.report_progress = true;

						instance.reportProgress = function reportProgress(value) {

							var plain,
							    s_val,
							    str;

							s_val = ~~value;

							plain = '{' + name + ' ' + s_val + '%}';
							str = esc(1, '{', 21) + esc('1;93', name, '39') + ' ' + s_val + '%}';

							that.argStringMap[index].plain = plain;
							that.argStringMap[index].colour = str;

							value = instance.constructor.prototype.reportProgress.call(instance, value);

							that.render();

							return value;
						};

						plain = '{' + left_side + ' ' + instance.progress + '%}';
						str = esc(1, '{', 21) + esc('1;93', left_side, '39') + ' ' + instance.progress + '%}';

					} else {

						let has_left_side = left_side != null && left_side !== '';

						str = esc(1, '{', 21);
						
						if (has_left_side) {
							str += esc('1;93', left_side, '39');
						}

						let right_side = this.getArgumentRightSide(arg);

						if (right_side != null && right_side !== '') {
							if (has_left_side) {
								str += ' ';
							}

							str += right_side;
						}

						str += '}';

						plain = stripEsc(str);
					}
				}
			} else {
				plain = String(arg);
				str = esc(31, plain);
			}

			// Get the startingpoint of this string in the line
			start = this.simpleMap.length;

			// Calculate the new end
			end = start + this.strlen(plain);

			// Make the simpleMap longer
			this.simpleMap.length = end;

			// Set the arg pointer value
			this.simpleMap.fill(i, start, end);

			// Set the arg string value
			this.argStringMap[i] = {
				arg: arg,
				plain: plain,
				colour: str,
			};

			// Add a space to the map
			this.simpleMap.push(' ');
		}
	});

	/**
	 * Return the (coloured) representation of this line's contents
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.2
	 *
	 * @param    {Number}   absX   On what (plain) char position was clicked
	 */
	ArgsLogLine.setMethod(function getContentString(absX) {

		var clickedArgNr,
		    highlighted,
		    str,
		    val,
		    xg,
		    i;

		if (typeof absX !== 'undefined') {

			// Calculate the X plus the gutter
			gx = this.getRelativeX(absX);

			clickedArgNr = this.simpleMap[gx];
		}

		str = '';

		for (i = 0; i < this.argStringMap.length; i++) {

			// Highlight the argument if it was clicked on
			if (i === clickedArgNr) {
				str += esc(7);
				highlighted = true;
			}

			val = this.argStringMap[i];
			str += val.colour;

			// Disable the highlight
			highlighted = false;
			str += esc(27);

			// Always add an empty space after an argument
			str += ' ';
		}

		return str;
	});

	/**
	 * Get the clicked on argument
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	ArgsLogLine.setMethod(function getArgByX(absX) {

		var argNr,
		    gx;

		// Calculate the x minus the gutter
		gx = this.getRelativeX(absX);

		argNr = this.simpleMap[gx];

		if (typeof argNr === 'number') {
			return this.argStringMap[argNr].arg;
		}
	});

	/**
	 * Get extra contents of the given variable
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.6
	 * @version  0.3.6
	 *
	 * @param    {Object}   arg
	 *
	 * @return   {Array}
	 */
	ArgsLogLine.setMethod(function getExtraContents(arg) {

		if (!(arg instanceof Map)) {
			return;
		}

		let result = [],
		    key,
		    val;

		for ([key, val] of arg) {
			result.push({[KEY]: key, [key]: val});
		}

		return result;
	});

	/**
	 * Get the length of the longest string
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.4
	 *
	 * @param    {Array}   strings
	 *
	 * @return   {Number}
	 */
	ArgsLogLine.setMethod(function getLongestLength(strings) {

		var result = 0,
		    len,
		    i = strings.length;

		if (i) while (i--) {
			len = this.strlen(strings[i]);

			if (len > result) {
				result = len;
			}
		}

		return result;
	});

	/**
	 * Select this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.4.3
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	ArgsLogLine.setMethod(function select(absX, level) {

		var symbol_properties,
		    getter_keys,
		    descriptor,
		    line_count,
		    propLine,
		    is_array,
		    max_page,
		    all_keys,
		    getters,
		    getter,
		    hprops,
		    length,
		    lines,
		    keys,
		    prev,
		    arg,
		    key,
		    i;

		if (typeof level !== 'number') {
			level = 0;
		}

		// Call the parent
		Janeway.LogLine.prototype.select.call(this, absX);

		// Get the clicked on argument
		arg = this.getArgByX(absX);

		if (this.pagination.arg != arg) {
			this.pagination = {
				page : 0,
				arg  : arg
			};
		}

		// Remember where we pressed when selecting this
		this.selected_abs_x = absX;

		line_count = 0;

		let arg_type = typeof arg;

		if (Buffer.isBuffer(arg)) {
			// Show a nice hexadecimal view of the buffer

			// The previous line is this parent one at the beginning
			prev = this;

			// See where the current page should start
			i = this.pagination.page * 25 * 16;

			// Calculate the max amount of pages
			max_page = (arg.length / (16 * 25)) - 1;

			this.pagination.max_page = max_page;

			if (max_page > 1) {
				propLine = new Janeway.PagingLogLine(this.logList);
				propLine.parent = this;
				this.children.push(propLine);
				this.logList.insertAfter(propLine, prev.index);
				prev = propLine;
			}

			// Iterate over the contents, show 16 bytes on every line
			for (; i < arg.length; i += 16) {
				line_count++;

				// Create a new line
				propLine = new Janeway.HexLogLine(this.logList);

				if (line_count == 1) {
					this.first_hex_line = propLine;
					propLine.first_line = true;
				}

				// Give it the buffer object
				propLine.set(arg, i, false, level);

				// Set this line as its parent
				propLine.parent = this;

				this.children.push(propLine);

				this.logList.insertAfter(propLine, prev.index);

				// Make a link to the this line in the previous one
				if (prev !== this) {
					prev.next = propLine;
				}

				prev = propLine;

				if (line_count >= 25) {
					break;
				}
			}

			if (propLine) {
				propLine.last_line = true;
			}

			if (max_page > 1 || this.pagination.page) {
				propLine = new Janeway.PagingLogLine(this.logList);
				propLine.parent = this;
				this.children.push(propLine);
				this.logList.insertAfter(propLine, prev.index);
				prev = propLine;
			}

		} else if ((arg_type == 'object' || arg_type == 'function') && arg) {
			// Read out the contents of this argument if it's an object!

			// First: get its own keys
			keys = Object.keys(arg);

			// We'll store all keys in here, too
			all_keys = keys.slice(0);

			// Is this an array?
			is_array = Array.isArray(arg);

			// Get all the getters
			getters = Blast.getObjectGetters(arg);

			// Get the getter keys
			getter_keys = [...getters.keys()];

			// Add all getter keys
			all_keys.push(...getter_keys);

			// Now get all the hidden ones
			hprops = Bound.Array.subtract(Object.getOwnPropertyNames(arg), all_keys);

			// Add all the hidden keys
			all_keys = all_keys.concat(hprops);

			// Get the length of the longest key
			length = this.getLongestLength(all_keys);

			// How many lines do we have already?
			lines = 0;

			// Get all symbol properties
			symbol_properties = Blast.getObjectSymbols(arg);

			let extra_contents = this.getExtraContents(arg);

			// Add 'prototype' to the hidden properties if it exists
			if (arg.__proto__) {
				hprops.push('__proto__');
			}

			if (this.janeway.config.properties.sort) {
				if (!is_array) {
					keys.sort();
				}

				hprops.sort();
				getter_keys.sort();
			}

			// Set the current (parent) as the prev item
			prev = this;

			if (arg_type === 'function') {
				lines++;
				propLine = new Janeway.PropertyLogLine(this.logList);
				propLine.longest_key = length;
				propLine.first_line = true;
				propLine.key = '[SOURCE]';

				propLine.set(arg, '[SOURCE]', {
					get: () => arg + '',
					enumerable: false,
					is_custom : true,
				}, level);

				// Set this line as its parent
				propLine.parent = this;

				this.children.push(propLine);

				// This will become insertLine later
				this.logList.insertAfter(propLine, prev.index);

				prev = propLine;
			}

			// First do the visible keys
			for (i = 0; i < keys.length; i++) {
				lines++;
				key = keys[i];

				// Create a new Property Log Line
				propLine = new Janeway.PropertyLogLine(this.logList);

				propLine.longest_key = length;

				if (lines == 1) {
					propLine.first_line = true;
					propLine.opens_array = is_array;
				}

				// Is this the last line?
				if (!hprops.length && keys.length == i+1 && getters.size == 0) {
					propLine.last_line = true;
					propLine.closes_array = is_array;
				}

				// Give it the complete arg object, and the key it needs to use
				// inside of it
				propLine.set(arg, key, true, level);

				// Set this line as its parent
				propLine.parent = this;

				this.children.push(propLine);

				// This will become insertLine later
				this.logList.insertAfter(propLine, prev.index);

				prev = propLine;
			}

			// Now do the getters
			for (i = 0; i < getter_keys.length; i++) {
				lines++;

				key = getter_keys[i];
				getter = getters.get(key);

				// Create a new Property Log Line
				propLine = new Janeway.PropertyLogLine(this.logList);

				propLine.longest_key = length;

				if (lines == 1) {
					propLine.first_line = true;
					propLine.opens_array = is_array;
				}

				// Is this the last line?
				if (!symbol_properties.length && !hprops.length && keys.length == i+1) {
					propLine.last_line = true;
					propLine.closes_array = is_array;
				}

				// Give it the complete arg object, and the key it needs to use
				// inside of it
				propLine.set(arg, key, getter, level);

				// Set this line as its parent
				propLine.parent = this;

				this.children.push(propLine);

				// This will become insertLine later
				this.logList.insertAfter(propLine, prev.index);

				prev = propLine;
			}

			if (extra_contents && extra_contents.length) {
				let extra;

				for (extra of extra_contents) {
					lines++;
					key = extra[KEY];

					// Create a new Property Log Line
					propLine = new Janeway.PropertyLogLine(this.logList);

					// @TODO: well this is no longer correct
					//propLine.longest_key = length;

					if (lines == 1) {
						propLine.first_line = true;
						propLine.opens_array = is_array;
					}

					// Give it the complete arg object, and the key it needs to use
					// inside of it
					propLine.set(extra, key, false, level);

					propLine.is_extra = true;

					// Set this line as its parent
					propLine.parent = this;

					this.children.push(propLine);

					// This will become insertLine later
					this.logList.insertAfter(propLine, prev.index);

					prev = propLine;
				}
			}

			// Now do the hidden ones
			for (i = 0; i < hprops.length; i++) {
				lines++;
				key = hprops[i];

				// Create a new Property Log Line
				propLine = new Janeway.PropertyLogLine(this.logList);

				propLine.longest_key = length;

				if (lines == 1) {
					propLine.first_line = true;
					propLine.opens_array = is_array;
				}

				if (!symbol_properties.length && hprops.length == i+1) {
					propLine.last_line = true;
					propLine.closes_array = is_array;
				}

				// Give it the complete arg object, and the key it needs to use
				// inside of it
				propLine.set(arg, key, false, level);

				// Set this line as its parent
				propLine.parent = this;

				this.children.push(propLine);

				// This will become insertLine later
				this.logList.insertAfter(propLine, prev.index);

				prev = propLine;
			}

			// Now do the symbols
			for (i = 0; i < symbol_properties.length; i++) {
				lines++;
				key = symbol_properties[i];

				descriptor = Object.getOwnPropertyDescriptor(arg, key);

				// Skip symbols that are getters
				// (we already got those)
				if (descriptor.get) {
					continue;
				}

				// Create a new Property Log Line
				propLine = new Janeway.PropertyLogLine(this.logList);

				propLine.longest_key = length;

				if (lines == 1) {
					propLine.first_line = true;
					propLine.opens_array = is_array;
				}

				if (symbol_properties.length == i+1) {
					propLine.last_line = true;
					propLine.closes_array = is_array;
				}

				// Give it the complete arg object, and the key it needs to use
				// inside of it
				propLine.set(arg, key, false, level);

				propLine.is_symbol = true;

				// Set this line as its parent
				propLine.parent = this;

				this.children.push(propLine);

				// This will become insertLine later
				this.logList.insertAfter(propLine, prev.index);

				prev = propLine;
			}

		} else if (arg_type == 'string' && (~arg.indexOf('\n') || ~arg.indexOf('\r'))) {

			// Split by newlines
			lines = arg.split(/\n|\r\n|\r/);

			prev = this;

			for (i = 0; i < lines.length; i++) {

				// Create a new line
				propLine = new Janeway.StringLogLine(this.logList);

				if (i == 0) {
					propLine.first_line = true;
				}

				// Give it the lines object
				propLine.set(lines, i, false, level);

				// Set this line as its parent
				propLine.parent = this;

				this.children.push(propLine);

				this.logList.insertAfter(propLine, prev.index);

				prev = propLine;
			}

			propLine.last_line = true;
		}

		return arg;
	});

	Janeway.ArgsLogLine = ArgsLogLine;
};