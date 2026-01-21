## 0.4.6 (2026-01-21)

* Use Protoblast methods to get an object's symbols & getters
* Add compact-mode, which disables colours and less loging when not using the tui
* Re-add clipboard support using OSC 52 escape sequences (works over SSH)

## 0.4.5 (2024-02-15)

* Fix package.json

## 0.4.4 (2024-02-14)

* Remove usage of bound `startsWith` method
* Make `ArgsLogLine#dissect()` clear the maps before starting

## 0.4.3 (2024-02-13)

* Small "getting property of `undefined`" fix
* Support for customized instance representation
* Fix editarea issue
* Fix terminal resize breaking the interface
* Add `Janeway#has_started` property

## 0.4.2 (2023-10-15)

* Small editarea fix
* Improve Bun v1.x compatibility
* Add separate `IndicatorItem` class instead of using simple objects
* Add sort support to `Indicator` class
* Create 3 indicator areas: left, center & right
* Add main menu to the left area, move `Copy JSON` button to it

## 0.4.1 (2023-02-12)

* Remove clipboard support (`copy-paste` dependency is abandoned)
* Upgrade `isBinaryFile` dependency
* Switch from `neo-blessed` to `reblessed` module

## 0.4.0 (2023-01-14)

* Upgrade to protoblast v0.8.0

## 0.3.6 (2022-10-22)

* Get some more `Map` feedback
* Merge UX tweaks from j1mmie/janeway
* Make the style of the time part of a status message configurable
* Make `Copy JSON` button also dump to a file
* Make scroll-wheel scroll step configurable
* Refuse to start on Bun for now
* Add `Janeway#reloadScreen()`, which re-enables the alternate buffer & mouse
* Supply the original `stdout` to blessed so reloading the screen will work
* Add `extra_output` stream option to which extra control sequences will also be sent
* Fix an off-by-one click issue

## 0.3.5 (2020-07-21)

* Add support for using `await` in the CLI
* Increase the `caller_info.min_length` default length to 26

## 0.3.4 (2020-07-11)

* Sort the properties by key (new boolean setting "properties.sort")
* Don't perform expensive object compare function by default (new boolean setting "properties.alike_objects")
* Don't show getter property values by default, they now require a click (boolean setting "properties.show_get_value")
* Cleanup the inline property inspection (used to use `utils.inspect`)
* Date objects now show a formatted string
* Use ellipsis instead of 3 dots
* Allow config to be in a `janeway.js` file, too
* Use `path.sep` to get the correct separator on windows
* Indicators can now be used to create menus

## 0.3.3 (2018-10-18)

* Finally add resize support
* Upgrade to `neo-blessed` fork

## 0.3.2 (2018-08-27)

* Make the minimum stack size configurable, defaults to 6

## 0.3.1 (2018-07-04)

* Fix additional opening curly braces

## 0.3.0 (2018-07-01)

* Add hexadecimal view of Buffers
* Fix getting the current scroll index on a click
* Add pagination support & implement in Buffer hex view
* Added `mouseup`, `mousedown`, `mousemove` and implemented `mousedrag` event
* Enabled selecting values in a `HexLogLine`
* Added `LogLin#getValueForClipboard`, for setting the value to copy to clipboard
* Starting Janeway with a binary file as argument will show the hex viewer
* Increase the captured stacktrace length
* `shutdown_on_exception` is now false by default
* Add exit shortcut to the configuration, refs #11
* Add basic evaluation support to the execbin, refs #10
* Read out getters to object inspection
* Pad the object key length to the longest length of all keys
* Also enable module evaluation when supplying `--evaluate`, refs #10

## 0.2.5 (2018-03-02)

* Added `Logline#render`, which re-renders the given line
* `ArgsLogLine#dissect` will now hook onto an object with a `reportProgress` method and display the progress as a percentage
* Add `blessed.screen` default options to user config
* Allow setting a custom `screen` in the `start(options)` to render Janeway to
* `Janeway#redraw` now calls `realloc` (instead of `alloc`) and a `render`
* An object's `namespace` will now be shown in an `ArgsLogLine`
* Add callback to `fs.writeFile` so it no longer throws the deprecated warning error
* Store the `vm_context` on the `Janeway` instance, so CLI variables can be set in other parts of the program
* Set the `$0` variable using the `vm_context`
* Detect clipboard pasting of multiline strings
* Crashing programs shouldn't cause broken terminals anymore

## 0.2.4 (2017-08-27)

* Setting indicators shouldn't crash the program when janeway hasn't loaded

## 0.2.3 (2017-08-11)

* `Janeway#args_name_map` property can be used to change which name `ArgsLogLine` shows (by default it's the filename with .js stripped of)
* Fix bug where indicator hover text would not be saved if updated while already visible
* Added capability to store external user configuration in `~/.janeway/janeway.json`
* Added persistent cli history
* Make autocomplete popup only as wide as the biggest suggestion
* Don't show empty lines in autocomplete popup
* Unselect current selected line when manually executing something via the cli

## 0.2.2 (2017-04-17)

* Set required file on `require.main` object
* `LogList#consoleLog` will now return the created `LogLine`

## 0.2.1 (2016-10-18)

* Added spinners, which can be rendered in the statusbar
* Added `Janeway#redraw`, which forces a re-render
* Added indicators

## 0.2.0 (2016-10-14)

* Added menu bar
* Added 'Copy' button to copy current selection to the clipboard
* The currently selected object/string will be stored under the $0 global
* `Janeway#setTitle(str)` will now set the title of the terminal tab
* Remove 'Line 0' when Janeway starts
* If a new line contains the same data as the previous one, it is not
  printed to screen, but a counter is added to that previous line.
* The CLI now uses a modified Textarea widget: arrow keys, delete, home, end now all work as they should
* Added a statusbar under the CLI, which can be set using `Janeway#setStatus`, it should only be given regular text, though it does support blessed tags.
* Move classes to the Develry.Janeway namespace
* The Janeway instance can now be accessed at the `__Janeway` global
* Only +/- 1000 lines will be stored, when going over that the top lines will be removed
* `eval` is no longer used to evaluate CLI code, now `vm#runInNewContext` is used
* The new CLI evaluation now has access to `require`
* Because of ditching `eval`, declaring variables (or asigning without `var`) will no longer create a global. In order to create on, you'll have to do something like `global.myglobal = 'globalvalue'`
* Added `getPropertyNames` to recursively look through an object's prototype chain to fill the autocomplete popup
* Command evaluation will first wrap the command in parentheses, if it fails it tries it without them.
* The `janeway` command will set the title on boot
* Autocomplete will now also select current item when typing '(', it already does this for '.', a tab and an enter

## 0.1.6 (2016-06-02)

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
