# File Prompt [![Travis][build-badge]][build] [![npm package][npm-badge]][npm]
An interactive prompt for files inspired by git add -i. By supplying a filter and a base directory and calling the `fileprompt` function you can interactively select from a list of matching files in a number of ways intended to speed up typing time trying to guess and remember paths. This tool can be used with Gulp to send a list of files to `gulp.src`.

![Screencast of file prompt in action][screenshot-image]

## Installation
Using [npm](https://wwww.npmjs.org):
```
$ npm install expect
```

## Usage
_In ES6:_

```js
import fileprompt from 'fileprompt'

fileprompt({ basedir: process.cwd(), filter: '*.js' })
  .then((files) => {
    // Array of absolute path files
  })
  .catch((e) => {
    // e is an instance of an Error Object that happened along the way.
  })

```

_In ES5:_

```js
var fileprompt = require('fileprompt');

fileprompt({ basedir: process.cwd(), filter: '*.js' })
  .then((files) => {
    // Array of absolute path files
  })
  .catch((e) => {
    // e is an instance of an Error Object that happened along the way.
  })

```

## Input
The following methods of input are currently supposed:

__Main Menu__
* _{int}_ __id__ - Number of the menu item to access
* _{string}_ __name__ - Must uniquely identify the beginning of a menu item

__Files__
* _{string}_ __*__ - Adds all files from the current page
* _{string}_ __-*__ - Removes all files from the current page
* _{int}_ __id__ - Number of the menu item to access
* _{string}_ __name__ - Must uniquely identify the beginning of a file name
* _{string}_ __n-n__ - Supports numeric ranges like 1-5
* _{string}_ __-n-n__ - Supports removing files within the given range

You can also supply multiple arguments like `4 5-10 -8` and it will do the following:
* Selected item # 4
* Select items # 5 through 10
* Unselect file # 8

## Supported Features
Currently the following features are supported
  
### Browing Directories
Lets you add files by entering directories and selecting files. Pressing `<enter>` will return to the main menu.

### Files
Lists all levels of files matching the supplied filter. Pressing `<enter>` will return to the main menu.

### Glob
Asks for a glob string such as `**/*.js`. If matches are found it will allow you to select from the list of matching files. Pressing `<enter>` will return to the main menu.

### Changed Files
Executes `git diff --name-only` to get a list of files changed since the last git commit. Pressing `<enter>` will return to the main menu.

[screenshot-image]: https://github.com/jayzawrotny/file-prompt/raw/master/docs/images/screenshot.png
[build-badge]: https://img.shields.io/travis/jayzawrotny/file-prompt/master.svg?style=flat-square
[build]: https://travis-ci.org/jayzawrotny/file-prompt)

[npm-badge]: https://img.shields.io/npm/v/file-prompt.svg?style=flat-square
[npm]: https://www.npmjs.org/package/file-prompt


## Credits
This tool was lovingly made for use at [VenueBook](https://venuebook.com/).
