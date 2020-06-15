module.exports = function defineIndicator(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function,
	    N = Bound.Number,
	    S = Bound.String;

	/**
	 * A generic indicator
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.3.4
	 *
	 * @param    {Janeway} janeway   The parent janeway instance
	 */
	var Indicator = F.inherits('Informer', 'Develry.Janeway', function Indicator(janeway, name, options) {

		if (typeof name == 'object') {
			options = name;
			name = options.name;
		}

		if (!options) {
			options = {};
		}

		// Parent janeway instance
		this.janeway = janeway;

		// Unique indicator name
		this.name = name;

		// When this indicator was first created
		this.created = new Date();

		// When this indicator was updated
		this.updated = null;

		// Possible selectable items
		this.items = [];

		// The weight of this indicator (for ordering)
		if (typeof options.weight == 'number') {
			this.weight = options.weight;
		} else {
			this.weight = 10;
		}

		// Don't do this if it hasn't loaded
		if (!janeway.indicator_area) {
			return;
		}

		// If an indicator already exists with this name, remove it
		if (janeway.indicator_area.indicators_by_name[name]) {
			janeway.indicator_area.indicators_by_name[name].remove();
		}

		janeway.indicator_area.indicators_by_name[name] = this;

		// Add it to the list
		this.janeway.indicator_area.indicators.push(this);

		if (!janeway.blessed) {
			return;
		}

		// This indicator box
		this.box = janeway.blessed.box({
			parent      : this.janeway.indicator_area,
			top         : 0,
			height      : 1,
			tags        : true,
			padding     : {
				left    : 1,
				right   : 1,
			},
			shrink      : true,
			mouse       : true,
			style  : {
				bg : 'white',
				fg : 'black',
				hover : {
					bg : 240,
					fg : 231
				}
			}
		});

		// Add this instance to the box
		this.box._janeway_indicator = this;

		// The characters of this indicator
		this.setIcon(options.icon || '◆');
	});

	/**
	 * Get the width of this indicator
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.2.1
	 *
	 * @type {Number}
	 */
	Indicator.setProperty(function width() {
		return 2 + this.icon.length;
	});

	/**
	 * Set the text of this status line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.2.1
	 *
	 * @param    {String}   characters
	 * @param    {Object}   options
	 */
	Indicator.setMethod(function setIcon(characters, options) {

		var seconds,
		    minutes,
		    date = new Date(),
		    text;

		if (options) {
			if (options.color) {
				characters = '{' + options.color + '-fg}' + characters + '{/' + options.color + '-fg}';
			}

			if (options.bold) {
				characters = '{bold}' + characters + '{/bold}';
			}
		}

		this.updated = date;
		this.output_icon = characters;

		// Characters will be used to determine length
		this.icon = this.janeway.stripEsc(characters.replace(/\{.*?\}/g, ''));

		this.render();
	});

	/**
	 * Set correct hover text
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.2.4
	 */
	Indicator.setMethod(function setHover(options) {

		if (!this.box) {
			return;
		}

		if (typeof options == 'string') {
			options = {text: options};
		}

		this.box._hoverLeftOptions = options;

		// If the hover box is already visible, update it directly
		if (this.janeway._hoverText._over_el == this.box) {
			this.janeway._hoverText.setContent(options.text);
			this.janeway.screen.render();
		} else {
			this.box.enableMouse();
		}
	});

	/**
	 * Remove this indicator
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.2.1
	 */
	Indicator.setMethod(function remove() {

		var index;

		// Mark this as removed
		this.removed = true;

		// Get the index in the array
		index = this.janeway.indicator_area.indicators.indexOf(this);

		if (index > -1) {
			this.janeway.indicator_area.indicators.splice(index, 1);
		}

		// Remove the actual element
		this.box.destroy();

		// Re-render the indicator area
		this.janeway._renderIndicatorArea();
	});

	/**
	 * Render this status
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.2.4
	 */
	Indicator.setMethod(function render() {

		var content;

		if (!this.box) {
			return;
		}

		content = '';

		content += this.output_icon;

		this.box.setContent(content);

		// Render the indicator area (needed for positioning)
		this.janeway._renderIndicatorArea();
	});

	/**
	 * Show the old-style hover text
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 *
	 * @param    {Boolean}   enable
	 */
	Indicator.setMethod(function showHoverText(enable) {

		const hover_text_el = this.janeway._hoverText;

		if (enable) {
			hover_text_el._over_el = this.box;
			hover_text_el.parseTags = this.box.parseTags;
			hover_text_el.setContent(this.box._hoverLeftOptions.text);
			this.janeway.screen.append(hover_text_el);

			hover_text_el.rright = this.box.position.right;

			hover_text_el.rtop = this.box.atop + 1;
		} else {

			if (hover_text_el.detached) {
				return;
			}

			hover_text_el._over_el = null;
			hover_text_el.detach();
		}

		this.janeway.screen.render();
	});

	/**
	 * Receiving mouseOver event
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 */
	Indicator.setMethod(function onMouseOver(data) {
		this.showHoverText(true);
	});

	/**
	 * Receiving mouseOut event
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 */
	Indicator.setMethod(function onMouseOut(data) {
		this.showHoverText(false);
	});

	/**
	 * Add a selectable item
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 *
	 * @param    {Object}     options
	 * @param    {Function}   callback
	 */
	Indicator.setMethod(function addItem(options, callback) {

		if (typeof options == 'string') {
			options = {
				title : options
			};
		}

		if (typeof callback == 'function') {
			options.callback = callback;
		}

		this.items.push(options);
	});

	Janeway.Indicator = Indicator;
};