var util = require('util');

module.exports = function defineLogLine(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function;

	/**
	 * A line representing a property of a parent object
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
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
	 * Set the parent object & name of the property this line is representing
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.0
	 *
	 * @param    {Mixed}            object       The actual value
	 * @param    {String}           key          The actual key of the property
	 * @param    {Boolean|Object}   enumerable   Is this enumerable?
	 * @param    {Number}           level
	 */
	PropertyLogLine.setMethod(function set(object, key, enumerable, level) {

		var descriptor;

		this.object = object;
		this.key = key;
		this.level = level || 0;

		if (enumerable && typeof enumerable == 'object') {
			descriptor = enumerable;
			this.descriptor = descriptor;
			this.enumerable = descriptor.enumerable;
			this.is_getter = !!descriptor.get;
		} else {
			this.enumerable = enumerable;
		}
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
	PropertyLogLine.setMethod(function getArgByX(absX) {
		return this.getValueByKey();
	});

	/**
	 * Get a value by key
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 *
	 * @param    {String}   key
	 */
	PropertyLogLine.setMethod(function getValueByKey(key) {

		if (key == null) {
			key = this.key;
		}

		try {
			if (this.key == key && this.is_getter && this.parent.key == '__proto__') {
				value = this.descriptor;
			} else {
				value = this.object[this.key];
			}
		} catch (err) {
			value = '[ERROR getting value "' + key + '"]';
		}

		return value;
	});

	/**
	 * Select this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	PropertyLogLine.setMethod(function select(absX, level) {

		var result;

		if (!this.open) {
			if (typeof level !== 'number') {
				level = this.level + 1 || 1;
			}

			result = select.super.call(this, absX, level);
		}

		// Remember this property log line is already open
		this.open = true;

		return result;
	});

	/**
	 * Return the (coloured) representation of this line's contents
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	PropertyLogLine.setMethod(function getContentString(x) {

		var length,
		    colour,
		    strVal,
		    value,
		    temp,
		    key,
		    str;

		value = this.getValueByKey();

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
				temp = util.inspect(value, {showHidden: true, depth: 1, customInspect: false}).replace(/\n|\r\n|\r/g, ' ');
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

		if (this.is_getter) {
			str += esc(90, '(get)', 39) + ' ';
		}

		key = this.key;

		if (this.longest_key) {
			if (this.is_getter) {
				length = this.longest_key;
			} else {
				length = this.longest_key + 6;
			}

			// Limit the length to 20
			if (length > 20) {
				length = 20;
			}

			key = Bound.String.padEnd(key, length);
		}

		str += esc(colour, key, 39) + esc(0) + ' : ' + strVal;

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