var Janeway = require('./index.js');

Janeway.start();

setImmediate(function() {
	console.log('At ease, ensign. Before you sprain something.');
});

process.on('uncaughtException', function(error) {
	Janeway.debug('Found error...');
	Janeway.debug(error);
});

for (var i = 0; i < 65; i++) {
	console.log('Line: ' + i);
}

setInterval(function() {
	console.log('Interval...');
}, 1000);