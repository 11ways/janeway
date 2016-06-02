## 0.1.6 (WIP)

* Add brackets when opening objects
* Also split strings on \r\n or \r newlines
* Show `__proto__` property when inspecting objects
* Add timestamp to loglines
* Remove '.js' from filenames
* Added `uncaughtException` listener to print errors before crashing
* Changed scrolledManually and scrollDown property to underscored name
* Let Janeway handle application crashes better

## 0.1.5 (2016-01-24)

* Add autocomplete (basic for now)
* Add CLI history
* Allow Janeway to be run globally
* Add date object to line info

## 0.1.4 (2016-01-20)

* Improve multiline string support
* Upgrade `blessed` dependency to 0.1.81
* Throttle the `render` method to not overload the process
* Automatically scroll down when new line is added
* Clicking on functions will now read out properties
* Pressing pageup/pagedown will scroll up or down
* Fix click/scroll index issues

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
