var Janeway = require('./index.js');

Janeway.start(function onReady(err) {
	console.log('At ease, ensign. Before you sprain something.');
});

process.on('uncaughtException', function onError(error) {
	Janeway.debug('Found error...');
	Janeway.debug(error);
});