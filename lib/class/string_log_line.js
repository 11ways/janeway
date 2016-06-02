var util = require('util');

module.exports = function defineLogLine(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function;

	/**
	 * A single string line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.4
	 * @version  0.1.4
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var StringLogLine = Janeway.PropertyLogLine.extend(function StringLogLine(logList) {
		// Call the parent constructor
		StringLogLine.super.call(this, logList);
	});

	/**
	 * Return the (coloured) representation of this line's contents
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.4
	 * @version  0.1.4
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	StringLogLine.setMethod(function getContentString(x) {

		var colour,
		    strVal,
		    value,
		    temp,
		    str;

		// Get the string line
		value = this.object[this.key];
		strVal = ''+value;
		colour = '1;90';

		str = '    ' + Bound.String.multiply('  ', this.level);

		str += esc(colour, Bound.Number.toPaddedString(Number(this.key), 2), 39) + esc(0) + ' ' + strVal + esc(0);

		return str;
	});

	Janeway.StringLogLine = StringLogLine;
};