var util = require('util');

module.exports = function defineLogLine(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function;

	/**
	 * A generic line of text in the log list output
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var PropertyLogLine = Janeway.ArgsLogLine.extend(function PropertyLogLine(logList) {

		// Call the parent constructor
		PropertyLogLine.super.call(this, logList);

		// The parent object
		this.object = null;

		// The key of the parent object
		this.key = null;

		// The level
		this.level = 0;

		// If this is enumerable
		this.enumerable = null;
	});

	/**
	 * Unselect this line
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Array}   args   An array of variables
	 */
	PropertyLogLine.setMethod(function set(object, key, enumerable, level) {
		this.object = object;
		this.key = key;
		this.level = level || 0;
		this.enumerable = enumerable;
	});

	/**
	 * Get the clicked on argument
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	PropertyLogLine.setMethod(function getArgByX(absX) {

		if (this.object) {
			return this.object[this.key];
		}
	});

	/**
	 * Select this line
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	PropertyLogLine.setMethod(function select(absX, level) {

		if (typeof level !== 'number') {
			level = this.level + 1 || 1;
		}

		select.super.call(this, absX, level);
	});

	/**
	 * Return the (coloured) representation of this line's contents
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.1.0
	 * @version  0.1.3
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	PropertyLogLine.setMethod(function getContentString(x) {

		var colour,
		    strVal,
		    value,
		    temp,
		    str;

		value = this.object[this.key];

		if (this.enumerable) {
			colour = '1;95';
		} else {
			colour = 35;
		}

		if (Bound.Object.isPrimitive(value)) {
			strVal = JSON.stringify(value);
		} else if (typeof value === 'function') {

			// Stringify the source code to escape newlines
			temp = JSON.stringify(value+'');

			// Return everything between the quotes
			strVal = temp.slice(1, temp.length-1);
		} else {

			try {
				temp = util.inspect(value, {showHidden: true, depth: 1, customInspect: false}).replace(/\n/g, ' ');
			} catch (err) {
				try {
					temp = ''+value;
				} catch (err) {
					temp = '[Could not stringify]';
				}
			}

			strVal = temp;
		}

		str = '   ' + Bound.String.multiply('  ', this.level);

		if (this.first_line) {
			if (this.opens_array) {
				str += '[ ';
			} else {
				str += '{ ';
			}
		} else {
			str += '  ';
		}

		str += esc(colour, this.key, 39) + esc(0) + ' : ' + strVal;

		if (this.last_line) {
			if (this.closes_array) {
				str += ' ]';
			} else {
				str += ' }';
			}
		}

		return str;
	});

	Janeway.PropertyLogLine = PropertyLogLine;
};