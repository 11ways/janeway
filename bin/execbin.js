#!/usr/bin/env node
var isBinaryFile = require('isbinaryfile'),
    Janeway      = require('../lib/init.js'),
    libpath      = require('path'),
    fs           = require('fs'),
    main_file,
    buffer,
    line;

// Get the wanted file to require
if (process.argv[2]) {
	main_file = libpath.resolve(process.cwd(), process.argv[2]);
}

// Remove janeway from the arguments array
process.argv.splice(1, 1);

// Start initializing janeway
Janeway.start(function started(err) {

	var title;

	if (err) {
		console.error('Could not start Janeway: ' + err);
	}

	// If the file is binary, show the hex viewer
	if (isBinaryFile.sync(main_file)) {
		try {
			buffer = fs.readFileSync(main_file);
			line = Janeway.print('info', [buffer]);

			// Simulate a click on index 25
			line.select(25);
		} catch (err) {
			console.error('Error opening binary file:', err);
		}

		return;
	}

	try {
		if (main_file) {
			title = JSON.stringify(process.argv[1]);
			Janeway.print('info', ['Requiring main file', title]);
			Janeway.setTitle('Janeway: ' + title);

			if (require.main) {
				require.main.janeway_required = main_file;
			}

			require(main_file);
		} else {
			Janeway.setTitle('Janeway');
		}
	} catch (err) {
		console.log('Error requiring main file: ', err);
	}
});
