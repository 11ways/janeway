module.exports = function defineLogLine(Janeway, Blast, Bound) {

	var stripEsc = Janeway.stripEsc,
	    esc = Janeway.esc,
	    F = Bound.Function;

	/**
	 * Lines from the CLI
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var CommandLogLine = Janeway.LogLine.extend(function CommandLogLine(logList) {

		CommandLogLine.super.call(this, logList);

		this.setGutter(esc('2;37') + '\u276f ' + esc(0)); // Fancy >
	});

	/**
	 * CLI input eval'ed lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var EvalOutputLogLine = Janeway.ArgsLogLine.extend(function EvalOutputLogLine(logList) {

		EvalOutputLogLine.super.call(this, logList);

		this.setGutter(esc('2;37') + '\u276e ' + esc(0)); // Fancy <
	});

	/**
	 * Error lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var ErrorLogLine = Janeway.ArgsLogLine.extend(function ErrorLogLine(logList) {

		ErrorLogLine.super.call(this, logList);

		this.setGutter(esc(91) + '\u2620 Error:' + esc(39)); // Skull
	});

	/**
	 * Warning lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var WarningLogLine = Janeway.ArgsLogLine.extend(function WarningLogLine(logList) {

		WarningLogLine.super.call(this, logList);

		this.setGutter(esc(93) + '\u26a0 ' + esc(39)); // Warning sign
	});

	/**
	 * Info lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var InfoLogLine = Janeway.ArgsLogLine.extend(function InfoLogLine(logList) {

		InfoLogLine.super.call(this, logList);

		this.setGutter(esc(34) + '\u24D8 ' + esc(39)); // Circled small letter i
	});

	/**
	 * Info lines
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.1
	 * @version  0.1.1
	 *
	 * @param    {LogList}   logList   The parent LogList instance
	 */
	var InfoLogLine = Janeway.ArgsLogLine.extend(function InfoLogLine(logList) {

		InfoLogLine.super.call(this, logList);

		this.setGutter(esc(34) + '\u24D8 ' + esc(39)); // Circled small letter i
	});

	Janeway.CommandLogLine = CommandLogLine;
	Janeway.EvalOutputLogLine = EvalOutputLogLine;
	Janeway.ErrorLogLine = ErrorLogLine;
	Janeway.WarningLogLine = WarningLogLine;
	Janeway.InfoLogLine = InfoLogLine;
};