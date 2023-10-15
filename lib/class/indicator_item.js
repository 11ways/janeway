const F = Bound.Function;

/**
 * An item in the list of an Indicator
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.4.2
 * @version  0.4.2
 *
 * @param    {Janeway} janeway   The parent janeway instance
 */
const IndicatorItem = F.inherits('Informer', 'Develry.Janeway', function IndicatorItem(indicator, options) {

	// The parent indicator
	this.indicator = indicator;

	// The janeway instance
	this.janeway = indicator.janeway;

	// The options of this item
	this.options = options || {};

	// The weight of this item (for default sorting)
	this.weight = this.options.weight ?? 10;

	if (!this.options.title) {
		this.options.title = '';
	}

	let style = Blast.Bound.JSON.clone(this.janeway.config.menu_item.style);

	if (!options.callback) {
		style.hover = null;
	}

	let box_options = {
		screen : this.janeway.screen,
		top    : indicator.items.length,
		tags   : false,
		height : 1,
		width  : '100%',
		style  : style,
		mouse  : true
	};

	if (indicator.align_left) {
		box_options.left = 0;
	} else {
		box_options.right = 0;
	}

	let box = this.janeway.blessed.box(box_options);

	this.box = box;

	box.on('mouse', function onMouse(e) {

		if (e.action == 'wheelup') {
			indicator.menu_list.scroll(-1);
		} else if (e.action == 'wheeldown') {
			indicator.menu_list.scroll(1);
		}

		indicator.menu_list.render();
		indicator.janeway.screen.render();
	});

	box.setContent(options.title);

	box._janeway_indicator = indicator;
	box._janeway_item = options;
	box.shrink = true;
	box.width = options.title.length + 1;

	box.on('click', function onClick(e) {

		if (typeof options.callback == 'function') {
			options.callback(e, options);
		}

		indicator.onMouseOut();
	});

	indicator.menu_list.append(box);
});

/**
 * Get the title of this item
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.4.2
 * @version  0.4.2
 */
IndicatorItem.setProperty(function title() {
	return this.options.title;
});

/**
 * Set the weight of this item, triggering a sort
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.4.2
 * @version  0.4.2
 *
 * @param    {Number}   weight
 */
IndicatorItem.setMethod(function setWeight(weight) {

	if (this.weight == weight) {
		return;
	}

	this.weight = weight;
	this.indicator.checkWeightChanges();
});

/**
 * Set the content of this item
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.4.2
 * @version  0.4.2
 */
IndicatorItem.setMethod(function setContent(text) {

	if (!text) {
		text = '';
	}

	this.box.setContent(text);
});

/**
 * Remove this item
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.4.2
 * @version  0.4.2
 */
IndicatorItem.setMethod(function remove() {

	const indicator = this.indicator;

	let index = indicator.items.indexOf(this);

	if (index > -1) {
		indicator.items.splice(index, 1);
	}

	this.box.detach();
	indicator.reorderItems();

	indicator.menu_list.render();
	indicator.janeway.screen.render();
});

/**
 * Set the top of the box
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.4.2
 * @version  0.4.2
 *
 * @param    {Number}   amount
 */
IndicatorItem.setMethod(function setBoxTop(amount) {
	this.box.top = amount;
});

/**
 * Set the width of the box
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.4.2
 * @version  0.4.2
 *
 * @param    {Number}   amount
 */
IndicatorItem.setMethod(function setBoxWidth(amount) {
	this.box.width = amount;
});

/**
 * Set the right of the box
 *
 * @author   Jelle De Loecker   <jelle@elevenways.be>
 * @since    0.4.2
 * @version  0.4.2
 *
 * @param    {Number}   amount
 */
IndicatorItem.setMethod(function setBoxRight(amount) {
	this.box.right = amount;
});