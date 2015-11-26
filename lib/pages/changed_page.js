'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vertical_menu = require('../vertical_menu');

var _vertical_menu2 = _interopRequireDefault(_vertical_menu);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _page = require('../page');

var _page2 = _interopRequireDefault(_page);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _prompt = require('../prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _actions = require('../actions');

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Menu Options format
 *
 * @example
 * [
 *   {
 *     id: 1,
 *     label: 'directories',
 *     name: 'directories',
 *     value: 'directories'
 *   },
 *   // ...
 * ]
 */

/**
 * Changed Files Page
 * The files menu page of our CLI app
 *
 * @class FilesPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */

var ChangedPage = (function (_Page) {
  _inherits(ChangedPage, _Page);

  /**
   * Constructor
   * Initializes this page's subclass
   *
   * @constructor
   * @param {object} props - Properties to initialize the class with
   */

  function ChangedPage(props) {
    _classCallCheck(this, ChangedPage);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ChangedPage).call(this, props));

    _this.question = 'Add files';
    return _this;
  }

  /**
   * Get Initial State
   * Initializes this component's state
   *
   * @method
   * @public
   * @returns {object} Initial state properties
   */

  _createClass(ChangedPage, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {
        files: this.getFiles(this.getGlob()),
        menu: new _vertical_menu2.default({
          canUnselect: true,
          acceptsMany: true,
          stdin: this.props.stdin,
          stdout: this.props.stdout,
          app: this.props.app
        }),
        prompt: new _prompt2.default({
          stdin: this.props.stdin,
          stdout: this.props.stdout
        })
      };
    }

    /**
     * Create Options From
     * Takes our selected files and builds a menu options array
     *
     * @method
     * @public
     * @param {array} files - Array of filenames to make into options
     * @returns {array} Array of menu options
     */

  }, {
    key: 'createOptionsFrom',
    value: function createOptionsFrom(files) {
      var selectedFiles = this.select('files'),
          basedir = this.getBasedir();

      return files.map(function (filename, i) {
        return {
          id: i + 1,
          label: _path2.default.relative(basedir, filename),
          name: filename,
          value: filename,
          isSelected: selectedFiles.indexOf(filename) > -1
        };
      }) || [];
    }

    /**
     * Get Files
     * Returns an array of files to select
     *
     * @method
     * @public
     * @param {string} pattern - Glob pattern to filter against
     * @returns {array} Array of menu options
     */

  }, {
    key: 'getFiles',
    value: function getFiles(pattern) {
      var basedir = this.getBasedir(),
          output = (0, _child_process.execSync)('git diff --name-only'),
          files = output.toString().split('\n'),
          mm = new _minimatch2.default.Minimatch(pattern);

      if (!files.length) return [];

      return files.map(function (filename) {
        return _path2.default.resolve(filename);
      }).filter(function (filename) {
        return mm.match(filename) && filename.indexOf(basedir) > -1;
      });
    }

    /**
     * Update Files
     * Selects or unselects files from the store
     *
     * @method
     * @public
     * @param {array} updates - Array of updates from the prompt
     */

  }, {
    key: 'updateFiles',
    value: function updateFiles(updates) {
      var _this2 = this;

      if (!Array.isArray(updates)) return;

      updates.forEach(function (update) {
        if (update.action === "select") {
          _this2.dispatch((0, _actions.addFile)(update.value));
        } else {
          _this2.dispatch((0, _actions.removeFile)(update.value));
        }
      });
    }

    /**
     * Prompt
     * Beckons the prompt
     *
     * @method
     * @public
     */

  }, {
    key: 'prompt',
    value: function prompt() {
      var _this3 = this;

      var reprompt = function reprompt() {
        _this3.props.stdout.write(_this3.renderMenu());
        _this3.prompt();
      };

      this.state.prompt.beckon(this.question).then(this.processInput.bind(this)).then(function (results) {
        var selectedItems = results.selectedItems;
        var queryCount = results.queryCount;

        /**
         * If the only input given is an empty response lets go back to
         * the index.
         */

        if (queryCount === 1 && selectedItems[0].value === null) {
          return _this3.navigate('index');
        }

        _this3.updateFiles(selectedItems);

        /**
         * If the only param was a single "*" add the files and navigate
         * away to the index page
         */
        if (queryCount === 1 && selectedItems[0].type === "all") {
          return _this3.navigate('index');
        }

        reprompt();
      }).catch(function (e) {
        _this3.displayError(e);
        reprompt();
      });
    }

    /**
     * Process Input
     * Deal with the answer from our prompt
     *
     * @method
     * @public
     * @param {string} answer - User input value
     * @returns {promise} Returns a promise to return the result
     */

  }, {
    key: 'processInput',
    value: function processInput(answer) {
      return this.state.menu.find(answer);
    }
  }, {
    key: 'renderMenu',
    value: function renderMenu() {
      this.state.menu.setOptions(this.createOptionsFrom(this.state.files));
      return this.state.menu.render();
    }
  }, {
    key: 'renderPrompt',
    value: function renderPrompt() {
      return this.prompt.bind(this);
    }
  }]);

  return ChangedPage;
})(_page2.default);

exports.default = ChangedPage;