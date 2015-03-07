## 0.1.3 (2015-03-07)

* Stringify Objects using util.inspect, to prevent toJSON interference
* Caller info is added (where the output came from in the script)
* Strings with newlines will be printed out along multiple lines when selected
* Updated blessed dependency

## 0.1.2 (2015-01-26)

* Fixed bug where lines were kept in memory and causes screen glitches
* Fixed global scope command problem (removed vm in favour of regular eval)
* Added Janeway.debug method, which outputs to a logfile
* Upgraded "blessed" dependency to 0.0.38
* More minor bugfixes

## 0.1.1 (2014-09-15)

* require('janeway') will now return an instance of the Janeway class
* Janeway now takes command of `stdout`, `stderr` and all the `console` methods
* Janeway is now also an event emitter (Using Protoblast's Informer class)
* Newlines are now replaced with a Unicode return symbol
* Added new commands to the CLI:
  - 'exit' will exit Janeway and the running app (as will Escape or Control+C)
  - 'cls' will clear the screen

## 0.1.0 (2014-09-14)

* Initial Github commit and npm release!