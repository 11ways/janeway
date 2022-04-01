module.exports = function defineStatus(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function,
	    N = Bound.Number,
	    S = Bound.String;

	/**
	 * A generic line of text for the status bar
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.2.1
	 *
	 * @param    {Janeway}        janeway   The parent janeway instance
	 * @param    {String}         text
	 * @param    {Boolean|String} spinner
	 */
	var Status = F.inherits('Informer', 'Develry.Janeway', function Status(janeway, text, spinner) {

		// Parent janeway instance
		this.janeway = janeway;

		// When this status was first created
		this.created = new Date();

		// When this status' text was updated
		this.updated = null;

		// Start text
		this.text = '';

		// Normalized text
		this.output_text = null;

		// Output time text
		this.output_time = null;

		// Optional spinner name
		this.spinner = null;

		// Current spinner frame
		this.spinner_frame = null;

		if (text) {
			this.setText(text);
		}

		if (spinner) {
			this.startSpinner(spinner);
		}
	});

	/**
	 * Set the text of this status line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.3.6
	 *
	 * @param    {String}   str
	 */
	Status.setMethod(function setText(str) {

		var seconds,
		    minutes,
		    date = new Date(),
		    text;

		this.updated = date;
		this.text = str;

		seconds = String(date.getSeconds());

		if (seconds.length < 2) {
			seconds = '0' + seconds;
		}

		minutes = String(date.getMinutes());

		if (minutes.length < 2) {
			minutes = '0' + minutes;
		}

		// We leave the right tag open
		text = '{right}';
		text += '{bold}' + str + '{/bold}';

		this.output_text = text;

		let config = this.janeway.config.status;

		if (config && config.time) {
			config = config.time;
		}

		if (config && config.enabled) {
			this.output_time = '@' + date.getHours() + ':' + minutes + ':' + seconds;

			if (config.fg) {
				this.output_time = '{' + config.fg + '-fg}' + this.output_time + '{/' + config.fg + '-fg}';
			}

			if (config.bg) {
				this.output_time = '{' + config.bg + '-bg}' + this.output_time + '{/' + config.bg + '-bg}';
			}
		}

		this.render();
	});

	/**
	 * Render this status
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.3.6
	 */
	Status.setMethod(function render() {

		var content;

		if (!this.janeway.status) {
			return;
		}

		content = this.output_text;

		if (this.spinner) {
			content += ' ' + this.spinner_char + ' ';
		}

		if (this.output_time) {
			content += ' ' + this.output_time;
		}

		this.janeway.status.setContent(content);
		this.janeway.status.render();
		this.janeway.screen.render();
	});

	/**
	 * Start a spinner
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.2.1
	 */
	Status.setMethod(function startSpinner(spinner_name) {

		var that = this,
		    interval,
		    frames,
		    config;

		if (spinner_name === true || spinner_name == null) {
			spinner_name = 'default';
		}

		// Get the 'frames'
		config = this.janeway.spinners[spinner_name];

		if (!config) {
			return;
		}

		this.spinner = spinner_name;
		this.spinner_frame = 0;

		if (typeof config == 'string') {
			frames = config;
			interval = 130;
		} else {
			frames = config.frames;
			interval = config.interval;
		}

		if (this.spinner_id) {
			clearInterval(this.spinner_id);
		}

		// Do a first update
		updateSpinner();

		// Schedule the spinner to update
		this.spinner_id = setInterval(updateSpinner, 130);

		function updateSpinner() {
			that.spinner_frame++;

			if (!frames[that.spinner_frame]) {
				that.spinner_frame = 0;
			}

			that.spinner_char = frames[that.spinner_frame];
			that.render();
		}
	});

	/**
	 * Stop the spinner
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.2.1
	 */
	Status.setMethod(function stopSpinner() {

		this.spinner = null;
		this.spinner_frame = null;
		this.spinner_char = '';

		if (this.spinner_id) {
			clearInterval(this.spinner_id);
		}

		this.render();
	});

	/**
	 * Stop any rendering
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.1
	 * @version  0.2.1
	 */
	Status.setMethod(function stop() {
		this.stopSpinner();
	});

	Janeway.Status = Status;
};