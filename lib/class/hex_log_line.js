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

			if (i == this.selected_index) {
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

			if (i == this.selected_index) {
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
	 * @version  0.2.6
	 *
	 * @param    {Number}   x   On what (plain) char position was clicked
	 */
	HexLogLine.setMethod(function select(absX, level) {

		var index = absX - 15;

		// Ignore clicks on the offset
		if (index < 0) {
			return;
		}

		if ((absX > 61 && absX < 66) || absX > 81) {
			return;
		}

		if (absX >= 66) {
			index = absX - 66;
		} else {
			index = ~~(index / 3);
		}

		this.selected_index = index + this.key;

		// Call the parent select method (forces a redraw)
		Janeway.LogLine.prototype.select.call(this, absX);
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

		this.render();

		// Call the parent select method (forces a redraw)
		Janeway.LogLine.prototype.unselect.call(this, newSelectedLine);
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