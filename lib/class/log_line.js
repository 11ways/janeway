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
	 * @version  0.2.5
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var LogLine = F.inherits('Informer', 'Develry.Janeway', function LogLine(logList) {

		// The LogList we belong to
		this.logList = logList;

		// Children lines (multiple instanceof LogLine)
		this.children = [];

		// Selecter char position
		this.selected_char_position = null;
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
	 * Reference to the janeway instance
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 */
	LogLine.setProperty(function janeway() {
		return this.logList.janeway;
	});

	/**
	 * Count the actual string length
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 *
	 * @param    {String}   str
	 *
	 * @return   {Number}
	 */
	LogLine.setMethod(function strlen(str) {

		// In case an older version of protoblast is somehow in use
		if (Blast.Bound.String.countCharacters) {
			return Blast.Bound.String.countCharacters(str);
		}

		return str.length;
	});

	/**
	 * Re-render this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.5
	 * @version  0.2.5
	 */
	LogLine.setMethod(function render() {

		// Set the line again
		this.logList._setLine(this.index, this.toString(this.selected_char_position));

		// And request a render
		this.logList.render();
	});

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
	 * @since    0.2.0
	 * @version  0.2.0
	 */
	LogLine.setMethod(function compare(args, type, options) {
		return false;
	});

	/**
	 * Add repeat counter
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.2.0
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
	 * @version  0.3.6
	 *
	 * @param    {Number}   absX
	 */
	LogLine.setMethod(function getRelativeX(absX) {
		let result = absX - (this.strlen(this.gutter) || 0) - (this.strlen(this.fileinfo) || 0);

		// Not sure yet why this is needed, but it fixes an off-by-one error somewhere
		result -= 1;

		return result;
	});

	/**
	 * Return the (coloured) representation of this line's contents
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.4
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	LogLine.setMethod(function getContentString(x) {

		var str = '';

		// If an x is provided, this means this line was clicked
		// so the colours should be inverted
		if (x != null) {
			str = esc(7);
		}

		str += this.string;

		if (x != null) {
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
	 * @version  0.3.4
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	LogLine.setMethod(function toString(x) {

		var str;

		// Workaround needed because blessed can't handle
		// emojis properly (even with this it still doesn't really)
		if (x != null) {
			this.had_selection = true;

			if (this.strlen(this.colouredGutter) != this.colouredGutter.length) {
				this.add_extra_gutter_string = true;
			}
		}

		str = this.colouredGutter;

		if (this.add_extra_gutter_string) {
			str += ' ';
		}

		str += this.colouredFileinfo;
		str += ' ' + this.getContentString(x);

		return str;
	});

	/**
	 * Select this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.2.5
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	LogLine.setMethod(function select(x) {

		// Unselect any previously selected line
		if (this.logList.selectedLine) {
			this.logList.selectedLine.unselect(this);
		}

		// Remember the selected char position
		this.selected_char_position = x;

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
	 * @version  0.2.5
	 *
	 * @param    {LogLine}   newSelectedLine
	 */
	LogLine.setMethod(function unselect(newSelectedLine) {

		// Remove the reference to this object in the logList parent
		this.logList.selectedLine = null;

		// Unset the selected char position
		this.selected_char_position = null;

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
	 * This line receives a drag event
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 *
	 * @param    {Object}   start
	 * @param    {Object}   end
	 */
	LogLine.setMethod(function mouseDrag(start, end) {
		// Only implemented in certain loglines
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