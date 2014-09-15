module.exports = function defineLogLine(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function;

	/**
	 * A generic line of text in the log list output
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
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
	});

	/**
	 * Unselect this line
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Array}   args   An array of variables
	 */
	ArgsLogLine.setMethod(function set(args) {
		this.args = args;
		this.dissect();
	});

	/**
	 * Dissect the given args,
	 * called after #set()
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	ArgsLogLine.setMethod(function dissect() {

		var index,
		    plain,
		    start,
		    temp,
		    hlen,
		    len,
		    end,
		    str,
		    arg,
		    i;

		index = 0;

		for (i = 0; i < this.args.length; i++) {
			arg = this.args[i];

			if (typeof arg == 'string') {
				plain = arg;
				str = esc(39, arg);
			} else if (typeof arg == 'number') {
				plain = String(arg);
				str = esc(36, plain);
			} else if (typeof arg == 'boolean') {
				plain = String(arg);
				str = esc(35, plain);
			} else if (arg && typeof arg === 'object') {

				hlen = Object.getOwnPropertyNames(arg).length;
				len = Object.keys(arg).length;

				if (hlen !== len) {
					len = hlen + '/' + len;
				}

				if (arg.constructor && arg.constructor.name) {
					temp = arg.constructor.name;
				} else {
					temp = 'Object';
				}

				plain = '{' + temp + ' ' + len + '}';
				str = esc(1, '{', 21) + esc('1;93', temp, '39') + ' ' + len + '}';
			} else {
				plain = String(arg);
				str = esc(31, plain);
			}

			// Get the startingpoint of this string in the line
			start = this.simpleMap.length;

			// Calculate the new end
			end = start + plain.length;

			// Make the simpleMap longer
			this.simpleMap.length = end;

			// Set the arg pointer value
			Bound.Array.fill(this.simpleMap, i, start, end);

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
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
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
	 * @author   Jelle De Loecker   <jelle@codedor.be>
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
	 * Select this line
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	ArgsLogLine.setMethod(function select(absX, level) {

		var propLine,
		    hprops,
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

		arg = this.getArgByX(absX);

		// Read out the contents of this argument if it's an object!
		if (typeof arg == 'object' && arg) {

			// First: get its own keys
			keys = Object.keys(arg);

			// Now get all the hidden ones
			hprops = Bound.Array.subtract(Object.getOwnPropertyNames(arg), keys);

			// Set the current (parent) as the prev item
			prev = this;

			// First do the visible keys
			for (i = 0; i < keys.length; i++) {
				key = keys[i];

				// Create a new Property Log Line
				propLine = new Janeway.PropertyLogLine(this.logList);

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

			// Now do the hidden ones
			for (i = 0; i < hprops.length; i++) {
				key = hprops[i];

				// Create a new Property Log Line
				propLine = new Janeway.PropertyLogLine(this.logList);

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
		}
	});

	Janeway.ArgsLogLine = ArgsLogLine;
};