module.exports = function defineIndicator(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    counter = 0,
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

		// The creation number
		this.creation_number = counter++;

		// When this indicator was updated
		this.updated = null;

		// Possible selectable items
		this.items = null;

		// Possible menu list
		this.menu_list = null;

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

			if (!this.box._hoverLeftOptions || !this.box._hoverLeftOptions.text) {
				return;
			}

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
	 * Show the menu
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 *
	 * @param    {Boolean}   enable
	 */
	Indicator.setMethod(function showMenu(enable) {

		const menu = this.menu_list;

		if (enable) {
			menu.rright = this.box.position.right;
			menu.rtop = this.box.atop + 1;
			menu.show();
			menu.setFront();
		} else {
			// We used to remove & re-add the elements on hover,
			// but that breaks the hover capability (blessed bug)
			menu.hide();
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
	Indicator.setMethod(function onMouseOver(el, data) {

		if (el === this.menu_list || this.janeway.isElementChild(el, this.menu_list)) {
			return;
		}

		if (this.items != null) {
			return this.showMenu(true);
		}

		this.showHoverText(true);
	});

	/**
	 * Receiving mouseOut event
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 */
	Indicator.setMethod(function onMouseOut(el, data) {

		if (this.items != null) {
			return this.showMenu(false);
		}

		this.showHoverText(false);
	});

	/**
	 * Initialize the menu properties
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 */
	Indicator.setMethod(function initMenu() {

		const that = this;

		this.items = [];

		const menu_list = this.janeway.blessed.box({
			scrollable: true,
			screen : this.janeway.screen,
			right  : 0,
			top    : 0,
			tags   : false,
			height : 'shrink',
			border : 'line',
			style  : Blast.Bound.JSON.clone(this.janeway.config.indicator.style),
			mouse  : true,
			scrollbar: Blast.Bound.JSON.clone(this.janeway.config.popup.scrollbar),
		});

		this.menu_list = menu_list;

		menu_list._janeway_indicator = this;

		this.janeway.screen.append(menu_list);
		menu_list.hide();
	});

	/**
	 * Enable/disable scrolling
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 *
	 * @param    {Boolean}   value
	 */
	Indicator.setMethod(function enableScroll(value) {

		if (value == null) {
			value = true;
		}

		let max_width = 0,
		    width,
		    right,
		    item;

		if (value) {
			right = 1;
			this.menu_list.height = 10;
		} else {
			right = 0;
			this.menu_list.height = this.items.length + 3;
		}

		for (item of this.items) {
			width = item.title.length + 1;
			item.box.width = width;
			item.box.right = right;

			if (width > max_width) {
				max_width = width;
			}
		}

		this.menu_list.scrollable = value;
		this.menu_list.width = max_width + 3 + right;

		this.menu_list.render();
	});

	/**
	 * Reorder the menu items
	 *
	 * @author   Jelle De Loecker   <jelle@elevenways.be>
	 * @since    0.3.4
	 * @version  0.3.4
	 */
	Indicator.setMethod(function reorderItems() {

		let index = 0,
		    item;

		for (item of this.items) {
			item.box.top = index++;
		}

		if (this.items.length > 10) {
			this.enableScroll(true);
		} else {
			this.enableScroll(false);
		}
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
	 *
	 * @return   {Object}
	 */
	Indicator.setMethod(function addItem(options, callback) {

		const that = this;

		if (typeof options == 'string') {
			options = {
				title : options
			};
		}

		if (typeof callback == 'function') {
			options.callback = callback;
		}

		if (this.items == null) {
			this.initMenu();
		}

		let style = Blast.Bound.JSON.clone(this.janeway.config.menu_item.style);

		if (!options.callback) {
			style.hover = null;
		}

		let box = this.janeway.blessed.box({
			screen : this.janeway.screen,
			right  : 0,
			top    : this.items.length,
			tags   : false,
			height : 1,
			width  : '100%',
			style  : style,
			mouse  : true
		});

		box.on('mouse', function onMouse(e) {

			var scrolled = false;

			if (e.action == 'wheelup') {
				that.menu_list.scroll(-1);
			} else if (e.action == 'wheeldown') {
				that.menu_list.scroll(1);
			}

			that.menu_list.render();
			that.janeway.screen.render();

		});

		box.setContent(options.title);

		box._janeway_indicator = this;
		box._janeway_item = options;
		box.shrink = true;
		box.width = options.title.length + 1;

		options.box = box;

		box.on('click', function onClick(e) {
			options.callback(e, options);

			that.onMouseOut();
		});

		this.menu_list.append(box);

		if (this.items.length > 10) {
			this.enableScroll(true);
		} else {
			this.enableScroll(false);
		}

		this.menu_list.render();
		this.janeway.screen.render();

		this.items.push(options);

		options.remove = function remove() {
			let index = that.items.indexOf(options);

			if (index > -1) {
				that.items.splice(index, 1);
			}

			box.detach();
			that.reorderItems();

			that.menu_list.render();
			that.janeway.screen.render();
		};

		return options;
	});

	Janeway.Indicator = Indicator;
};