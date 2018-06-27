#!/usr/bin/env node
var isBinaryFile = require('isbinaryfile'),
    Janeway      = require('../lib/init.js'),
    libpath      = require('path'),
    fs           = require('fs'),
    vm           = require('vm'),
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

	var vm_options,
	    title,
	    code,
	    nr;

	if (err) {
		console.error('Could not start Janeway: ' + err);
	}

	// If the file is binary, show the hex viewer
	if (fs.existsSync(main_file) && isBinaryFile.sync(main_file)) {
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
			Janeway.setTitle('Janeway: ' + title);

			if (require.main) {
				require.main.janeway_required = main_file;
			}

			if (Janeway.config.execbin.evaluate_files) {

				Janeway.print('info', ['Evaluating main file', title]);

				if (!main_file.endsWith('.js')) {
					main_file += '.js';
				}

				code = fs.readFileSync(main_file, 'utf8');

				code = 'var __dirname = ' + JSON.stringify(libpath.dirname(main_file)) + ';'
				     + 'var __filename = ' + JSON.stringify(libpath.basename(main_file)) + ';'
				     + code;

				vm_options = {
					filename    : main_file
				};

				try {
					vm.runInContext(code, Janeway.vm_context, vm_options);
					return;
				} catch (err) {
					if (err.message == 'Illegal return statement') {
						// Try again without the return!
						nr = err.stack.split('\n')[0].split(':')[1];

						// Split the code
						code = code.split('\n');

						// Keep only the lines before the return
						code = code.slice(0, nr);

						// Remove everything from the return
						code[code.length - 1] = __Protoblast.Bound.String.before(code[code.length - 1], 'return');

						// Join the code again
						code = code.join('\n');

						try {
							vm.runInContext(code, Janeway.vm_context, vm_options);
							return;
						} catch (err) {
							if (err.name != 'SyntaxError') {
								console.error(err);
								return;
							}
						}

					} else {
						if (err.name != 'SyntaxError') {
							console.error(err);
							return;
						}
					}

					Janeway.print('info', ['SyntaxError', err, 'evaluating file, falling back to `require`']);
				}
			}

			Janeway.print('info', ['Requiring main file', title]);
			require(main_file);
		} else {
			Janeway.setTitle('Janeway');
		}
	} catch (err) {
		console.log('Error requiring main file: ', err);
	}
});
