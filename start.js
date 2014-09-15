var Janeway = require('./index.js');

Janeway.start();

setImmediate(function() {
	console.log('At ease, ensign. Before you sprain something.');
});