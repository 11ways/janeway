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
	 * @version  0.2.0
	 *
	 * @param    {Janeway}   janeway   The parent janeway instance
	 */
	var Status = F.inherits('Informer', 'Develry.Janeway', function Status(janeway, text) {

		// Parent janeway instance
		this.janeway = janeway;

		// When this status was first created
		this.created = new Date();

		// When this status' text was updated
		this.updated = null;

		// Start text
		this.text = '';

		if (text) {
			this.setText(text);
		}
	});

	/**
	 * Set the text of this status line
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.2.0
	 *
	 * @param    {String}   str
	 */
	Status.setMethod(function setText(str) {

		var seconds,
		    minutes,
		    date = new Date(),
		    text;

		this.updated = date;

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
		text += ' {blue-fg}' + date.getHours() + ':' + minutes + ':' + seconds + '{/blue-fg}';

		//str = '{right}' +  date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ' ' + str + '{/right}';

		this.text = text;
		this.render();
	});

	/**
	 * Render this status
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.2.0
	 * @version  0.2.0
	 */
	Status.setMethod(function render() {
		this.janeway.status.setContent(this.text);
		this.janeway.status.render();
		this.janeway.screen.render();
	});

	Janeway.Status = Status;
};