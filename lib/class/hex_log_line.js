module.exports = function hexLogLine(Janeway, Blast, Bound) {
	'use strict';

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function;

	/**
	 * A single hex line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.6
	 * @version  0.2.6
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var HexLogLine = Janeway.PropertyLogLine.extend(function HexLogLine(logList) {
		// Call the parent constructor
		HexLogLine.super.call(this, logList);
	});

	/**
	 * Return the (coloured) representation of this line's contents
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.6
	 * @version  0.2.6
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	HexLogLine.setMethod(function getContentString(x) {

		var result,
		    offset,
		    ascii,
		    count  = 0,
		    start  = this.key,
		    temp,
		    end    = this.key + 16,
		    hex,
		    i;

		// Get the offset as a nice string
		offset = '    ' + esc('1;90', Number(this.key).toString(16).padStart(6, '0') + '  ');

		// Prepare the results
		hex = '';
		ascii = '';

		if (end > this.object.length) {
			end = this.object.length;
		}

		for (i = start; i < end; i++) {
			count++;
			temp = this.object[i].toString(16).padStart(2, '0');

			if (this.shouldHighlight(i)) {
				temp = esc('1;41;93', temp);
			}

			hex += temp + ' ';

			if (false) {
				if (this.object[i] >= 32 && this.object[i] <= 126) {
					temp = String.fromCharCode(this.object[i]);
				} else {
					temp = ' ';
				}
			} else {
				temp = Janeway.ascii_table[this.object[i]];
			}

			if (this.shouldHighlight(i)) {
				temp = esc('1;41;93', temp);
			}

			ascii += temp;

		}

		hex = hex.padEnd(48, ' ');
		ascii = ascii.padEnd(16, ' ');

		// Construct the visible result
		result = offset + hex + esc('1;90', ' │ ') + ascii + esc('1;90', ' │');

		return result;
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
	HexLogLine.setMethod(function select(absX, level) {

		var index = this.getBufferIndex(absX);

		this.selected_index = index;

		if (index == null) {
			return;
		}

		this.renderAll(true);

		// Call the parent select method (forces a redraw)
		Janeway.LogLine.prototype.select.call(this, absX);
	});

	/**
	 * Get the index in the buffer for the given X coordinate
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	HexLogLine.setMethod(function getBufferIndex(absX) {

		var index = absX - 15;

		// Ignore clicks on the offset
		if (index < 0) {
			return null;
		}

		if ((absX > 61 && absX < 66) || absX > 81) {
			return null;
		}

		if (absX >= 66) {
			index = absX - 66;
		} else {
			index = ~~(index / 3);
		}

		return index + this.key;
	});

	/**
	 * Get the value to copy to the clipboard, if any
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 *
	 * @param    {Mixed}   current_value
	 */
	HexLogLine.setMethod(function getValueForClipboard(current_value) {

		if (this.highlight_start == null || this.highlight_end == null) {
			return;
		}

		return this.object.slice(this.highlight_start, this.highlight_end + 1);
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
	HexLogLine.setMethod(function unselect(newSelectedLine) {

		if (this == newSelectedLine) {
			return;
		}

		this.selected_index = null;

		this.renderAll(true);

		// Call the parent select method (forces a redraw)
		Janeway.LogLine.prototype.unselect.call(this, newSelectedLine);
	});

	/**
	 * Render this line and all its siblings
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 *
	 * @param    {Boolean}   clear_highlight
	 */
	HexLogLine.setMethod(function renderAll(clear_highlight) {

		var parent = this.parent,
		    first,
		    cur;

		if (!parent) {
			return;
		}

		first = parent.first_hex_line;

		if (!first) {
			return;
		}

		cur = first;

		do {
			if (clear_highlight) {
				cur.highlight_start = null;
				cur.highlight_end = null;
			}

			cur.render();
			cur = cur.next;
		} while (cur.next);
	});

	/**
	 * Should we highlight this index?
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 *
	 * @param    {Number}   index
	 *
	 * @return   {Boolean}
	 */
	HexLogLine.setMethod(function shouldHighlight(index) {

		if (index == this.selected_index) {
			return true;
		}

		if (this.highlight_start == null || this.highlight_end == null) {
			return false;
		}

		if (this.highlight_start <= index && this.highlight_end >= index) {
			return true;
		}

		return false;
	});

	/**
	 * Highlight this line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.3.0
	 * @version  0.3.0
	 *
	 * @param    {Number}   start_index
	 * @param    {Number}   end_index
	 */
	HexLogLine.setMethod(function highlight(start_index, end_index) {

		var temp;

		if (start_index > end_index) {
			temp = start_index;
			start_index = end_index;
			end_index = temp;
		}

		// Set the highlight boundayr indexes
		this.highlight_start = start_index;
		this.highlight_end = end_index;

		// Render this line
		this.render();

		if (this.next) {
			this.next.highlight(start_index, end_index);
		}
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
	HexLogLine.setMethod(function mouseDrag(start, end) {

		var start_index,
		    end_index;

		// Start & end should be a HexLogLine
		if (!start.line || !start.line.getBufferIndex) {
			return;
		}

		start_index = start.line.getBufferIndex(start.x);
		end_index = end.line.getBufferIndex(end.x);

		// Start the highlight with the first line,
		// it'll call `highlight` on every next one, too
		start.line.parent.first_hex_line.highlight(start_index, end_index);

		this.parent.drag_start = start_index;
		this.parent.drag_end = end_index;
	});

	// Since ␀ (null) appears so often, I forced it to be a space
	Janeway.cp437_table = [
		' ',  '☺',  '☻',  '♥',  '♦',  '♣',  '♠',  '•',
		'◘',  '○',  '◙',  '♂',  '♀',  '♪',  '♫',  '☼',
		'►',  '◄',  '↕',  '‼',  '¶',  '§',  '▬',  '↨',
		'↑',  '↓',  '→',  '←',  '∟',  '↔',  '▲',  '▼',
		' ',  '!', '\"',  '#',  '$',  '%',  '&', '\'',
		'(',  ')',  '*',  '+',  ',',  '-',  '.',  '/',
		'0',  '1',  '2',  '3',  '4',  '5',  '6',  '7',
		'8',  '9',  ':',  ';',  '<',  '=',  '>',  '?',
		'@',  'A',  'B',  'C',  'D',  'E',  'F',  'G',
		'H',  'I',  'J',  'K',  'L',  'M',  'N',  'O',
		'P',  'Q',  'R',  'S',  'T',  'U',  'V',  'W',
		'X',  'Y',  'Z',  '[', '\\',  ']',  '^',  '_',
		'`',  'a',  'b',  'c',  'd',  'e',  'f',  'g',
		'h',  'i',  'j',  'k',  'l',  'm',  'n',  'o',
		'p',  'q',  'r',  's',  't',  'u',  'v',  'w',
		'x',  'y',  'z',  '{',  '|',  '}',  '~',  '⌂',
		'Ç',  'ü',  'é',  'â',  'ä',  'à',  'å',  'ç',
		'ê',  'ë',  'è',  'ï',  'î',  'ì',  'Ä',  'Å',
		'É',  'æ',  'Æ',  'ô',  'ö',  'ò',  'û',  'ù',
		'ÿ',  'Ö',  'Ü',  '¢',  '£',  '¥',  '₧',  'ƒ',
		'á',  'í',  'ó',  'ú',  'ñ',  'Ñ',  'ª',  'º',
		'¿',  '⌐',  '¬',  '½',  '¼',  '¡',  '«',  '»',
		'░',  '▒',  '▓',  '│',  '┤',  '╡',  '╢',  '╖',
		'╕',  '╣',  '║',  '╗',  '╝',  '╜',  '╛',  '┐',
		'└',  '┴',  '┬',  '├',  '─',  '┼',  '╞',  '╟',
		'╚',  '╔',  '╩',  '╦',  '╠',  '═',  '╬',  '╧',
		'╨',  '╤',  '╥',  '╙',  '╘',  '╒',  '╓',  '╫',
		'╪',  '┘',  '┌',  '█',  '▄',  '▌',  '▐',  '▀',
		'α',  'ß',  'Γ',  'π',  'Σ',  'σ',  'µ',  'τ',
		'Φ',  'Θ',  'Ω',  'δ',  '∞',  'φ',  'ε',  '∩',
		'≡',  '±',  '≥',  '≤',  '⌠',  '⌡',  '÷',  '≈',
		'°',  '∙',  '·',  '√',  'ⁿ',  '²',  '■',  ' '
	];

	Janeway.ascii_table = [
		' ',  '␁',  '␂',  '␃',  '␄',  '␅',  '␆',  '␇',
		'␈',  '␉',  '␊',  '␋',  '␌',  '␍',  '␎',  '␏',
		'␐',  '␑',  '␒',  '␓',  '␔',  '␕',  '␖',  '␗',
		'␘',  '␙',  '␚',  '␛',  '␜',  '␝',  '␞',  '␟',
		' ',  '!', '\"',  '#',  '$',  '%',  '&', '\'',
		'(',  ')',  '*',  '+',  ',',  '-',  '.',  '/',
		'0',  '1',  '2',  '3',  '4',  '5',  '6',  '7',
		'8',  '9',  ':',  ';',  '<',  '=',  '>',  '?',
		'@',  'A',  'B',  'C',  'D',  'E',  'F',  'G',
		'H',  'I',  'J',  'K',  'L',  'M',  'N',  'O',
		'P',  'Q',  'R',  'S',  'T',  'U',  'V',  'W',
		'X',  'Y',  'Z',  '[', '\\',  ']',  '^',  '_',
		'`',  'a',  'b',  'c',  'd',  'e',  'f',  'g',
		'h',  'i',  'j',  'k',  'l',  'm',  'n',  'o',
		'p',  'q',  'r',  's',  't',  'u',  'v',  'w',
		'x',  'y',  'z',  '{',  '|',  '}',  '~',  '⌂',
		'Ç',  'ü',  'é',  'â',  'ä',  'à',  'å',  'ç',
		'ê',  'ë',  'è',  'ï',  'î',  'ì',  'Ä',  'Å',
		'É',  'æ',  'Æ',  'ô',  'ö',  'ò',  'û',  'ù',
		'ÿ',  'Ö',  'Ü',  '¢',  '£',  '¥',  '₧',  'ƒ',
		'á',  'í',  'ó',  'ú',  'ñ',  'Ñ',  'ª',  'º',
		'¿',  '⌐',  '¬',  '½',  '¼',  '¡',  '«',  '»',
		'░',  '▒',  '▓',  '│',  '┤',  '╡',  '╢',  '╖',
		'╕',  '╣',  '║',  '╗',  '╝',  '╜',  '╛',  '┐',
		'└',  '┴',  '┬',  '├',  '─',  '┼',  '╞',  '╟',
		'╚',  '╔',  '╩',  '╦',  '╠',  '═',  '╬',  '╧',
		'╨',  '╤',  '╥',  '╙',  '╘',  '╒',  '╓',  '╫',
		'╪',  '┘',  '┌',  '█',  '▄',  '▌',  '▐',  '▀',
		'α',  'ß',  'Γ',  'π',  'Σ',  'σ',  'µ',  'τ',
		'Φ',  'Θ',  'Ω',  'δ',  '∞',  'φ',  'ε',  '∩',
		'≡',  '±',  '≥',  '≤',  '⌠',  '⌡',  '÷',  '≈',
		'°',  '∙',  '·',  '√',  'ⁿ',  '²',  '■',  ' '
	];

	Janeway.HexLogLine = HexLogLine;
};