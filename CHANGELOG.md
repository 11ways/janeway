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