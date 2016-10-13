module.exports = function defineLogLine(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function,
	    N = Bound.Number,
	    S = Bound.String;

	/**
	 * A generic line of text in the log list output
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.3
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var LogLine = F.inherits(function LogLine(logList) {

		// The LogList we belong to
		this.logList = logList;

		// Children lines (multiple instanceof LogLine)
		this.children = [];
	});

	/**
	 * The index of this line (set by logList)
	 */
	LogLine.setProperty('index', null);

	/**
	 * The stripped-of-colour gutter
	 */
	LogLine.setProperty('gutter', '  ');

	/**
	 * The coloured gutter content
	 */
	LogLine.setProperty('colouredGutter', '  ');

	/**
	 * The file info
	 */
	LogLine.setProperty('fileinfo', '');

	/**
	 * The coloured file info
	 */
	LogLine.setProperty('colouredFileinfo', '');

	/**
	 * The simple string representation of this line
	 */
	LogLine.setProperty('string', '');

	/**
	 * The coloured string
	 */
	LogLine.setProperty('coloured', '');

	/**
	 * Parent line (instanceof LogLine)
	 */
	LogLine.setProperty('parent', null);

	/**
	 * How many times this has been seen
	 */
	LogLine.setProperty('seen', 1);

	/**
	 * Actually output a string to the screen (insert)
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 *
	 * @param    {Number}   index
	 * @param    {String}   str
	 */
	LogLine.setMethod(function _setLine(index, str) {
		return this.logList._setLine(index, str);
	});

	/**
	 * Actually output a string to the screen
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 *
	 * @param    {Number}   index
	 * @param    {String}   str
	 */
	LogLine.setMethod(function _insertLine(index, str) {
		return this.logList._insertLine(index, str);
	});

	/**
	 * Set the (plain) string value
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {String}   str
	 */
	LogLine.setMethod(function set(str, gutter) {
		this.string = String(str);

		if (typeof gutter !== 'undefined') {
			this.setGutter(gutter);
		}
	});

	/**
	 * Compare new arguments to this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.7
	 * @version  0.1.7
	 */
	LogLine.setMethod(function compare(args, type, options) {
		return false;
	});

	/**
	 * Add repeat counter
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.7
	 * @version  0.1.7
	 */
	LogLine.setMethod(function addRepeat(nr) {
		this.seen += nr;

		if (this.fileObject) {
			this.fileObject.seen = this.seen;
			this.fileObject.last_seen = new Date();
		}
	});

	/**
	 * Set the (coloured) gutter
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {String}   str
	 */
	LogLine.setMethod(function setGutter(str) {
		this.colouredGutter = String(str);
		this.gutter = stripEsc(this.colouredGutter);
	});

	/**
	 * Set the fileinfo
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.3
	 * @version  0.1.3
	 *
	 * @param    {Object}   info
	 */
	LogLine.setMethod(function setFileinfo(info) {

		if (typeof info == 'string') {
			this.colouredFileinfo = ' ' + info;
		} else {

			// Add the time info first
			this.colouredFileinfo = ' ' + esc(90, '[') + esc(1, N.toPaddedString(info.time.getHours(), 2) + ':' + N.toPaddedString(info.time.getMinutes(), 2) + ':' + N.toPaddedString(info.time.getSeconds(), 2)) + esc(90, ']');

			// Then add the file info
			this.colouredFileinfo += ' ' + esc(90, '[') + esc(1, info.file + ':' + info.line) + esc(90, ']');

			this.file = info.file;
			this.fileline = info.line;
		}

		this.fileinfo = stripEsc(this.colouredFileinfo);
	});

	/**
	 * Convert the absolute x-position into a relative one,
	 * without the gutter length
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Number}   absX
	 */
	LogLine.setMethod(function getRelativeX(absX) {
		return absX - (this.gutter.length || 0) - (this.fileinfo.length || 0);
	});

	/**
	 * Return the (coloured) representation of this line's contents
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	LogLine.setMethod(function getContentString(x) {

		var str = '';

		// If an x is provided, this means this line was clicked
		// so the colours should be inverted
		if (typeof x !== 'undefined') {
			str = esc(7);
		}

		str += this.string;

		if (typeof x !== 'undefined') {
			str += esc(27);
		}

		return str;
	});

	/**
	 * Return a (coloured) representation of this line,
	 * including prefix and postfix gutter
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	LogLine.setMethod(function toString(x) {

		var str;

		str = this.colouredGutter + this.colouredFileinfo;
		str += ' ' + this.getContentString(x);

		return str;
	});

	/**
	 * Select this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.7
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	LogLine.setMethod(function select(x) {

		// Unselect any previously selected line
		if (this.logList.selectedLine) {
			this.logList.selectedLine.unselect(this);
		}

		// Select this line as the newly selected one
		this.logList.selectedLine = this;

		// Set the line string
		this._setLine(this.index, this.toString(x));

		return this;
	});

	/**
	 * Unselect this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogLine}   newSelectedLine
	 */
	LogLine.setMethod(function unselect(newSelectedLine) {

		// Remove the reference to this object in the logList parent
		this.logList.selectedLine = null;

		// Remove our child lines if needed
		if (!newSelectedLine || this === newSelectedLine || !newSelectedLine.isDescendantOf(this)) {

			if (this.parent) {
				return this.parent.unselect(newSelectedLine);
			}

			// Remove all children (this can be perfected later)
			this.logList.clearLines(this.getChildIndices());

			this.children.length = 0;
		}

		this._setLine(this.index, this.toString());
	});

	/**
	 * See if this is a descendant of the given line.
	 * This checks the entire parent line.
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogLine}   possibleAncestor
	 */
	LogLine.setMethod(function isDescendantOf(possibleAncestor) {

		// If the item has no parent it's false for sure
		if (!this.parent) {
			return false;
		}

		if (this.parent === possibleAncestor) {
			return true;
		}

		return this.parent.isDescendantOf(possibleAncestor);
	});

	/**
	 * See if this is a child of the given line.
	 * Checks only the parent.
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogLine}   possibleParent
	 *
	 * @return   {Boolean}   True if this is a child, false if it's not
	 */
	LogLine.setMethod(function isChildOf(possibleParent) {

		if (this.parent && this.parent === possibleParent) {
			return true;
		}

		return false;
	});


	/**
	 * Return an array of indices of this line and all its children
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	LogLine.setMethod(function getAllIndices() {

		var child,
		    arr,
		    i;

		arr = [];

		if (typeof this.index === 'number') {

			// The first to remove is this line itself
			arr.push(this.index);

			// Now get all the indices of the children
			for (i = 0; i < this.children.length; i++) {
				arr = arr.concat(this.children[i].getAllIndices());
			}
		}

		return arr;
	});

	/**
	 * Get all the child indices (recursively)
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	LogLine.setMethod(function getChildIndices() {

		var arr,
		    i;

		arr = [];

		// Now get all the indices of the children
		for (i = 0; i < this.children.length; i++) {
			arr = arr.concat(this.children[i].getAllIndices());
		}

		return arr;
	});

	Janeway.LogLine = LogLine;
};