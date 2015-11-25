'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _vertical_menu = require('../vertical_menu');

var _vertical_menu2 = _interopRequireDefault(_vertical_menu);

var _page = require('../page');

var _page2 = _interopRequireDefault(_page);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _prompt = require('../prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _actions = require('../actions');

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
 * Glob Page
 * The files menu page of our CLI app
 *
 * @class GlobPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */

var GlobPage = (function (_Page) {
  _inherits(GlobPage, _Page);

  /**
   * Constructor
   * Initializes this page's subclass
   *
   * @constructor
   * @param {object} props - Properties to initialize the class with
   */

  function GlobPage(props) {
    _classCallCheck(this, GlobPage);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(GlobPage).call(this, props));
  }

  /** LIFECYCLE METHODS */

  /**
   * Get Initial State
   * Initializes this component's state
   *
   * @method
   * @public
   * @returns {object} Initial state properties
   */

  _createClass(GlobPage, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {
        files: [],
        filter: null,
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
     * Component Should Update
     * Used to determine if component should re-render when state updates
     * occur. For this component it should not.
     *
     * @method
     * @public
     * @returns {boolean} False to prevent component from re-rendering.
     */

  }, {
    key: 'componentShouldUpdate',
    value: function componentShouldUpdate() {
      return false;
    }

    /** HELPER METHODS */

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
          basedir = this.props.basedir || this.select('config.basedir');

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
     * @param {string} pattern - Glob string to look for
     * @returns {array} Array of menu options
     */

  }, {
    key: 'getFiles',
    value: function getFiles(pattern) {
      var basedir = this.props.basedir || this.select('config.basedir');

      return _glob2.default.sync(_path2.default.join(basedir, pattern), { cwd: process.cwd() });
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

      /**
       * If files have been found from the glob, lets
       */
      if (this.state.files.length) {
        this.state.prompt.beckon(this.question()).then(this.processInput.bind(this)).then(function (results) {
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
        }).catch(function () {
          reprompt();
        });
      } else {
        this.state.prompt.beckon(this.question()).then(function (answer) {
          var files = [];

          /**
           * If the only input given is an empty response lets go back to
           * the index.
           */
          if (!answer) {
            return _this3.navigate('index');
          }

          files = _this3.getFiles(answer);

          if (!files.length) throw new Error('no_glob_match');

          _this3.setState({
            filter: answer,
            files: files
          });

          reprompt();
        }).catch(function (e) {
          switch (e.message) {
            case 'no_glob_match':
              _this3.props.stdout.write(_chalk2.default.bold.red('No files found. Try again.\n'));
              break;
          }
          reprompt();
        });
      }
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

    /**
     * Question
     * Returns the prompt question based on if files have been selected
     * or not
     *
     * @method
     * @public
     * @returns {string} Prompt string to ask the user
     */

  }, {
    key: 'question',
    value: function question() {
      var basedir = this.props.basedir || this.select('config.basedir');

      if (this.state.files.length) {
        return 'Add files';
      }

      basedir = _path2.default.relative(_path2.default.resolve(this.select('config.basedir'), '..'), basedir);

      return 'Enter glob from ' + basedir;
    }

    /** RENDER METHODS */

  }, {
    key: 'renderMenu',
    value: function renderMenu() {
      if (!this.state.files.length) return '';

      this.state.menu.setOptions(this.createOptionsFrom(this.state.files));

      return this.state.menu.render();
    }
  }, {
    key: 'renderPrompt',
    value: function renderPrompt() {
      return this.prompt.bind(this);
    }
  }]);

  return GlobPage;
})(_page2.default);

exports.default = GlobPage;