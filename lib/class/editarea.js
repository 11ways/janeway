/**
 * Editarea - modified blessed textarea
 * With edit modifications by Jin Kim
 *
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */
var nextTick = global.setImmediate || process.nextTick.bind(process),
    unicode  = require('reblessed/dist/lib/unicode'),
    helpers  = require('reblessed/dist/lib/helpers'),
    Input    = require('reblessed/dist/lib/widgets/input'),
    Node     = require('reblessed/dist/lib/widgets/node');

/**
 * Editarea
 */
function Editarea(options) {
	var self = this;

	if (!(this instanceof Node)) {
		return new Editarea(options);
	}

	options = options || {};

	options.scrollable = options.scrollable !== false;

	Input.call(this, options);

	this.screen._listenKeys(this);

	this.value = options.value || '';

	this.editorMargin = {left: 0, top: 0};

	this._resetCursor();
	this.__updateCursor = this._updateCursor.bind(this);
	this.on('resize', this.__updateCursor);
	this.on('move', this.__updateCursor);

	if (options.inputOnFocus) {
		this.on('focus', this.readInput.bind(this, null));
	}

	// Mark it dirty on each keypress
	this.on('keypress', function onKey(ch, key) {
		self.dirty = true;

		if (!options.inputOnFocus && options.keys) {
			if (self._reading) return;
			if (key.name === 'enter' || (options.vi && key.name === 'i')) {
				return self.readInput();
			}
			if (key.name === 'e') {
				return self.readEditor();
			}
		}
	});

	if (options.mouse) {
		this.on('click', function(data) {
			if (self._reading) return;
			if (data.button !== 'right') return;
			self.readEditor();
		});
	}
}

Editarea.prototype.__proto__ = Input.prototype;

Editarea.prototype.type = 'editarea';

Editarea.prototype._getLineContent = function(line) {
	var lineContent = this._clines[line];

	if (lineContent === undefined) {
		lineContent = this._clines[this._clines.length - 1];
	}

	return lineContent;
};

Editarea.prototype._hasRetrun = function(line) {
	if (line === undefined) {
		var lpos = this._getCoords();
		line = this.cursor.y - lpos.yi + this.itop;
	}

	return this._clines.rtof[line] !== this._clines.rtof[line + 1];
};

Editarea.prototype._cursorMaxRight = function(line, lpos) {
	lpos = lpos ? lpos : this._getCoords();

	var lineContent = this._getLineContent(line)
		, cursorMax = lpos.xi + this.ileft + this.strWidth(lineContent);

	return this._hasRetrun(line) || lineContent === '' ? cursorMax : cursorMax - 1;
};

// I think this is supposed to return the cursor's CURRENT max bottom
// So where it should go on the Y axis?
Editarea.prototype._cursorMaxBottom = function(lpos) {
	lpos = lpos ? lpos : this._getCoords();

	return lpos.yi + this.itop + this._getMaxLine(lpos);
};

Editarea.prototype._getMaxLine = function _getMaxLine(lpos) {

	var line_one,
	    line_two,
	    line;

	// Get the coordinates if lpost isn't set yet
	lpos = lpos ? lpos : this._getCoords();

	line_one = this._clines.length - 1 - (this.childBase || 0);
	line_two = (lpos.yl - lpos.yi) - this.iheight - 1;

	line = Math.min(line_one, line_two);

	// When calling clearValue() on a full editarea with a border, the first
	// argument in the above Math.min call ends up being -2. Make sure we stay
	// positive.
	return Math.max(0, line);
};

Editarea.prototype._setCursor = function(y, x) {
	if (y !== null && y !== undefined) {
		this.cursor.y = y;
		this.editorCursor.y = y - this.editorMargin.top;
	}

	if (x !== null && x !== undefined) {
		this.cursor.x = x;
		this.editorCursor.x = x - this.editorMargin.left;
	}
};

Editarea.prototype._applyCursor = function(lpos) {

	var cyMax;

	lpos = lpos ? lpos : this._getCoords();

	// This was originally the code to calculate cyMax,
	// but it doesn't seem to work when the textarea is
	// positioned using bottom (or anyway: this.iheight is always 0)
	//cyMax = lpos.yl - lpos.yi + this.iheight;

	cyMax = lpos.yl;

	// If the cursor goes too far, return it to the maximum allowed position
	if (this.cursor.y >= cyMax) {
		this._setCursorY(cyMax);
	}

	this.screen.program.cup(this.cursor.y, this.cursor.x);
};

Editarea.prototype._setCursorY = function(val) {
	this._setCursor(val, null);
};

Editarea.prototype._setCursorX = function(val) {
	this._setCursor(null, val);
};

Editarea.prototype._resetCursor = function() {
	this.cursor = {x: undefined, y: undefined};
	this.editorCursor = {x: 0, y: 0};
};

Editarea.prototype._indexOfContentOnCursor = function() {
	var idx = 0;

	// TODO: It has performance issue.
	//       Need to change the "element.parseContent" function to improve this.
	for (var y = 0; y < this.childBase + this.editorCursor.y; y++) {

		let line = this._clines[y];

		if (line == null) {
			continue;
		}

		idx = idx +
			line.replace(/\u0003/g, '').length +
			(y > 0 && this._hasRetrun(y - 1) ? 1 : 0);
	}

	if (this._clines[y] !== undefined) {
		idx = idx + 1 +
			this._clines[y].slice(0, this.editorCursor.x).replace(/\u0003/g, '').length +
			(y > 0 && this._hasRetrun(y - 1) ? 1 : 0);
	}

	return idx;
};

Editarea.prototype._updateCursor = function _updateCursor(get, input) {

	var max_line,
	    lpos,
	    cx = this.cursor.x,
	    cy = this.cursor.y;

	if (this.screen.focused !== this) {
		return;
	}

	// Only update the cursor if it is dirty
	// (so when a key is typed)
	if (!this.dirty && this.dirty != null) {
		return;
	}

	// Enable this during debugging if you want less _updateCursor calls
	// This gets called on every render, so every `console.log` inside this
	// function would call another _updateCursor, so it updates for infinity
	//this.dirty = false;

	// Get the position of this Editarea on the screen
	lpos = get ? this.lpos : this._getCoords();

	// If it isn't on the screen, do nothing?
	if (!lpos) {
		return;
	}

	// Get the max index of lines
	max_line = this._getMaxLine();

	// Get the max (the lowest, actually) position of the cursor
	var cyMax = this._cursorMaxBottom(lpos),
	    scroll_index = this.getScroll();

	if (!scroll_index && cy < lpos.yi) {
		cy = lpos.yi;
		this._setCursorY(cy);
	} else if (scroll_index > 0 && !input && cy > lpos.yi + max_line) {
		cy -= 1;
		this._setCursorY(cy);
	}

	this.editorMargin.top = lpos.yi + this.itop;
	this.editorMargin.left = lpos.xi + this.ileft;

	var currentLine = this.childBase + cy - this.editorMargin.top,
	    program = this.screen.program;

	var cxMax = this._cursorMaxRight(currentLine, lpos),
	    lineMax = this._clines.width + this.editorMargin.left;

	if (this.cursor.x === undefined || this.cursor.y === undefined) {
		this.cursor.y = cyMax;
		this.cursor.x = cxMax;
	}

	// XXX Not sure, but this may still sometimes
	// cause problems when leaving editor.
	if (cy == cyMax && cy === program.y && cx === program.x) {
		return;
	}

	if (cy === cyMax) {
		if (cx > program.x) {
			if (cx <= cxMax) {
				this._setCursorX(cx);
			} else if (input && cx < lineMax) {
				this._setCursorX(cxMax + 1);
			} else if (cy < cyMax || cx === lineMax) {
				// Go down and the start of below line
				this._setCursor(this.cursor.y + 1, this.editorMargin.left);
			} else {
				this._setCursorX(cxMax);
			}
		} else if (cx < program.x) {
			if (cx >= this.editorMargin.left) {
				this._setCursorX(cx);
			} else if (cy > this.editorMargin.top) {
				// Go up and the end of upper line
				this.cursor.x = this.editorMargin.left + this.strWidth(this._clines[currentLine - 1]);

				if (!this._hasRetrun(currentLine - 1)) {
					this.cursor.x = this.cursor.x - 1;
				}

				// Go up
				// This is where it goes wrong: the cursor goes up,
				// and the edit area's content gets scrolled up too,
				// so we're suddenly 2 rows higher
				this._setCursor(cy - 1, this.cursor.x);
			} else {
				this._setCursorX(this.editorMargin.left);
			}
		}
	} else {
		if (cy > cyMax) {
			if (input) {
				this._setCursor(cy, this.editorMargin.left);
			} else if (cy <= cyMax) {
				var nextCxMax = this._cursorMaxRight(currentLine, lpos);
				this._setCursor(cy, nextCxMax < cx ? nextCxMax : this.cursor.x);
			} else {
				this._setCursorY(cyMax);
			}
			this.scrollTo(currentLine)
		} else if (cy < cyMax) {
			if (cy >= this.editorMargin.top) {
				var prevCxMax = this._cursorMaxRight(currentLine, lpos);
				this._setCursor(cy, prevCxMax < cx ? prevCxMax : this.cursor.x);
			} else {
				this._setCursorY(this.editorMargin.top);
			}
			this.scrollTo(currentLine)
		} else {
			this._setCursor(cy, cx);
		}
	}

	this._applyCursor(lpos);
};

Editarea.prototype.input =
Editarea.prototype.setInput =
Editarea.prototype.readInput = function(callback) {
	var self = this
		, focused = this.screen.focused === this;

	if (this._reading) return;
	this._reading = true;

	this._callback = callback;

	if (!focused) {
		this.screen.saveFocus();
		this.focus();
	}

	this.screen.grabKeys = true;

	this._updateCursor();
	this.screen.program.showCursor();
	//this.screen.program.sgr('normal');

	this._done = function fn(err, value) {
		if (!self._reading) return;

		if (fn.done) return;
		fn.done = true;

		self._reading = false;

		delete self._callback;
		delete self._done;

		self.removeListener('keypress', self.__listener);
		delete self.__listener;

		self.removeListener('blur', self.__done);
		delete self.__done;

		self.screen.program.hideCursor();
		self.screen.grabKeys = false;

		if (!focused) {
			self.screen.restoreFocus();
		}

		if (self.options.inputOnFocus) {
			self.screen.rewindFocus();
		}

		// Ugly
		if (err === 'stop') return;

		if (err) {
			self.emit('error', err);
		} else if (value != null) {
			self.emit('submit', value);
		} else {
			self.emit('cancel', value);
		}
		self.emit('action', value);

		if (!callback) return;

		return err
			? callback(err)
			: callback(null, value);
	};

	// Put this in a nextTick so the current
	// key event doesn't trigger any keys input.
	nextTick(function() {
		self.__listener = self._listener.bind(self);
		self.on('keypress', self.__listener);
	});

	this.__done = this._done.bind(this, null, null);
	this.on('blur', this.__done);
};

Editarea.prototype.moveCursorHorizonal = function (count, input) {
	this.cursor.x = this.cursor.x + count;
	this._updateCursor(null, input);
};

Editarea.prototype.moveCursorVertical = function (count, input) {
	this.cursor.y = this.cursor.y + count;
	this._updateCursor(null, input);
};

Editarea.prototype.moveCursorHorizonalByCharacter = function (direction, input) {
	var cursorMove;

	if (direction == 'home') {
		this._setCursorX(0);
		this._updateCursor();
		return;
	}

	if (direction == 'end') {
		// +1 for the index + another 1 to get behind the last character
		this._setCursorX(this.value.length + 2);
		this._updateCursor();
		return;
	}

	direction = direction === "left" ? -1 : 1;

	if (!this.screen.fullUnicode) {
		cursorMove = direction;
	} else {
		if (this._clines?.[this.editorCursor.y]?.[this.editorCursor.x + direction] === '\u0003') {
			cursorMove = direction * 2;
		} else {
			cursorMove = direction;
		}
	}

	this.moveCursorHorizonal(cursorMove, input);
};

Editarea.prototype._listener = function(ch, key) {
	var done = this._done
		, value = this.value
		, charIdx;

	if (key.name === 'return') return;
	if (key.name === 'enter') {
		ch = '\n';
	}

	if (this.options.keys && key.ctrl && key.name === 'e') {
		return this.readEditor();
	}

	switch (key.name) {

		case 'escape':
			done(null, null);
			break;

		case 'end':
		case 'home':
		case 'left':
		case 'right':
			this.moveCursorHorizonalByCharacter(key.name);
			break;

		case 'up':
			this.moveCursorVertical(-1);
			break;

		case 'down':
			this.moveCursorVertical(1);
			break;

		case 'backspace':
			if (this.value.length) {
				this.moveCursorHorizonalByCharacter('left', true);
			}
			// Fall through!

		case 'delete':
			if (this.value.length) {
				charIdx = this._indexOfContentOnCursor();
				this.value = this.value.slice(0, charIdx - 1) + this.value.slice(charIdx);
			}
			break;

		default:
			if (ch) {
				if (!/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) {
					charIdx = this._indexOfContentOnCursor();
					this.value = this.value.slice(0, charIdx - 1) + ch + this.value.slice(charIdx - 1);

					if(ch === '\n') {
						this.moveCursorVertical(1, true);
					} else {
						// TODO: don't move when user change input method for CJK.
						this.moveCursorHorizonal(unicode.charWidth(ch), true);
					}
				}
			}
	}

	if (this.value !== value) {
		this.screen.render();
	}
};

Editarea.prototype._typeScroll = function() {
	// XXX Workaround
	var height = this.height - this.iheight;
	if (this._clines.length - this.childBase > height) {
		this.scroll(this._clines.length);
	}
};

Editarea.prototype.getValue = function() {
	return this.value;
};

Editarea.prototype.setValue = function(value, move_to_end) {
	if (value == null) {
		value = this.value;
	}
	if (this._value !== value) {
		this.value = value;
		this._value = value;
		this.setContent(this.value);
		if (this.cursor.y && this.cursor.y >= this.height + this.iheight) {
			this._typeScroll();
		}
		this._updateCursor();
	}

	if (move_to_end) {
		// Move the cursor to the end when setting the value
		this.moveCursorHorizonalByCharacter('end');
	}
};

Editarea.prototype.clearInput =
Editarea.prototype.clearValue = function() {
	this._resetCursor();
	return this.setValue('');
};

Editarea.prototype.submit = function() {
	if (!this.__listener) return;
	return this.__listener('\x1b', { name: 'escape' });
};

Editarea.prototype.cancel = function() {
	if (!this.__listener) return;
	return this.__listener('\x1b', { name: 'escape' });
};

Editarea.prototype.render = function() {
	this.setValue();
	return this._render();
};

Editarea.prototype.editor =
Editarea.prototype.setEditor =
Editarea.prototype.readEditor = function(callback) {
	var self = this;

	if (this._reading) {
		var _cb = this._callback
			, cb = callback;

		this._done('stop');

		callback = function(err, value) {
			if (_cb) _cb(err, value);
			if (cb) cb(err, value);
		};
	}

	if (!callback) {
		callback = function() {};
	}

	return this.screen.readEditor({ value: this.value }, function(err, value) {
		if (err) {
			if (err.message === 'Unsuccessful.') {
				self.screen.render();
				return self.readInput(callback);
			}
			self.screen.render();
			self.readInput(callback);
			return callback(err);
		}
		self.setValue(value);
		self.screen.render();
		return self.readInput(callback);
	});
};

/**
 * Expose
 */

module.exports = Editarea;