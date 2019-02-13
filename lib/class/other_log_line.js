module.exports = function defineLogLine(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function;

	/**
	 * Lines from the CLI
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.4
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var CommandLogLine = Janeway.LogLine.extend(function CommandLogLine(logList) {

		CommandLogLine.super.call(this, logList);

		this.setGutter(esc('2;37') + this.janeway.config.strings.gutters.input + esc(0));
	});

	/**
	 * CLI input eval'ed lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.4
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var EvalOutputLogLine = Janeway.ArgsLogLine.extend(function EvalOutputLogLine(logList) {

		EvalOutputLogLine.super.call(this, logList);

		this.setGutter(esc('2;37') + this.janeway.config.strings.gutters.output + esc(0));
	});

	/**
	 * Error lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.4
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var ErrorLogLine = Janeway.ArgsLogLine.extend(function ErrorLogLine(logList) {

		ErrorLogLine.super.call(this, logList);

		this.is_error = true;

		this.setGutter(esc(91) + this.janeway.config.strings.gutters.error + esc(39));
	});

	/**
	 * Warning lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.3.4
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var WarningLogLine = Janeway.ArgsLogLine.extend(function WarningLogLine(logList) {

		WarningLogLine.super.call(this, logList);

		this.setGutter(esc(93) + this.janeway.config.strings.gutters.warning + esc(39));
	});

	/**
	 * Info lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.3.4
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var InfoLogLine = Janeway.ArgsLogLine.extend(function InfoLogLine(logList) {

		InfoLogLine.super.call(this, logList);

		this.setGutter(esc(34) + this.janeway.config.strings.gutters.info + esc(39));
	});

	Janeway.CommandLogLine = CommandLogLine;
	Janeway.EvalOutputLogLine = EvalOutputLogLine;
	Janeway.ErrorLogLine = ErrorLogLine;
	Janeway.WarningLogLine = WarningLogLine;
	Janeway.InfoLogLine = InfoLogLine;
};