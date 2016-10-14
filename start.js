var Janeway = require('./index.js');

Janeway.start(function onReady(err) {

	var spinner,
	    id,
	    i = 0;

	console.log('At ease, ensign. Before you sprain something.');

	Janeway.setTitle('Janeway\'s terminal title');
	Janeway.setStatus('This is the statusbar');

	// Some crappy code just to show how status setText works
	id = setInterval(function spinnerInterval() {

		var spintext;

		if (!spinner) {
			spinner = Janeway.setStatus();
		}

		i += 10;

		spintext = Janeway.Blast.Bound.String.multiply('*', Math.ceil(i/10));
		spintext += Janeway.Blast.Bound.String.multiply(' ', Math.ceil((100-i)/10));

		spinner.setText(spintext);

		if (i == 100) {
			clearInterval(id);
		}
	}, 500);
});

process.on('uncaughtException', function onError(error) {
	Janeway.debug('Found error...');
	Janeway.debug(error);
});