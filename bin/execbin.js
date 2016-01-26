#!/usr/bin/env node
var Janeway = require('../lib/init.js'),
    libpath = require('path'),
    main_file;

// Get the wanted file to require
if (process.argv[2]) {
	main_file = libpath.resolve(process.cwd(), process.argv[2]);
}

// Remove janeway from the arguments array
process.argv.splice(1, 1);

// Start initializing janeway
Janeway.start(function started(err) {

	if (err) {
		console.error('Could not start Janeway: ' + err);
	}

	try {
		if (main_file) {
			Janeway.print('info', ['Requiring main file', JSON.stringify(process.argv[1])]);
			require(main_file);
		}
	} catch (err) {
		console.log('Error requiring main file: ' + err);
	}
});
