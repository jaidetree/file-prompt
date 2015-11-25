'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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
 * Directory Page
 * The files menu page of our CLI app
 *
 * @class DirectoriesPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */

var DirectoriesPage = (function (_Page) {
  _inherits(DirectoriesPage, _Page);

  /**
   * Constructor
   * Initializes this page's subclass
   *
   * @constructor
   * @param {object} props - Properties to initialize the class with
   */

  function DirectoriesPage(props) {
    _classCallCheck(this, DirectoriesPage);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DirectoriesPage).call(this, props));

    _this.question = 'Add files or enter directory';
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

  _createClass(DirectoriesPage, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {
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
     * Get Files
     * Returns an array of files to select
     *
     * @param {string} [basedir] - Directory to look through
     * @returns {array} Array of menu options
     */

  }, {
    key: 'getFiles',
    value: function getFiles(dir) {
      var configBasedir = this.select('config.base'),
          isBaseDir = dir === configBasedir,
          selectedFiles = this.select('files'),
          files = [];

      files = _fs2.default.readdirSync(dir);

      files = files.map(function (file, i) {
        var filepath = _path2.default.join(dir, file),
            label = _path2.default.relative(dir, filepath),
            stats = _fs2.default.statSync(filepath),
            isDirectory = stats.isDirectory();

        if (isDirectory) {
          label = label + '/';
        }

        return {
          id: isBaseDir ? i + 1 : i + 2,
          name: label,
          value: filepath,
          isSelected: selectedFiles.indexOf(filepath) > -1,
          label: isDirectory ? _chalk2.default.bold(label) : label
        };
      });

      if (dir !== configBasedir) {
        files.unshift({
          id: 1,
          name: _path2.default.basename(_path2.default.resolve(dir, '..')),
          value: _path2.default.resolve(dir, '..'),
          label: _chalk2.default.bold('..')
        });
      }

      return files;
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

        // Returns true if navigating, if so don't reprompt :D
        if (_this3.processFiles(selectedItems)) {
          return results;
        }

        reprompt();
      }).catch(function () {
        reprompt();
      });
    }

    /**
     * Process Files
     *
     * @method
     * @public
     * @param {array} selections - Selected files & folders
     * @returns {boolean} If we are navigating or not
     */

  }, {
    key: 'processFiles',
    value: function processFiles(selections) {
      var _this4 = this;

      var selectedFiles = [],
          selectedDir = null;

      selections.forEach(function (selection) {
        var filepath = selection.value,
            stats = _fs2.default.statSync(filepath);

        if (stats.isDirectory() && !selectedDir && selection.type !== 'all') {
          selectedDir = filepath;
        } else if (!stats.isDirectory()) {
          selectedFiles.push(selection);
        }

        _this4.updateFiles(selectedFiles);
      });

      if (selectedDir) {
        this.navigate('directories', { base: selectedDir });
        return true;
      }

      return false;
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
      this.state.menu.setOptions(this.getFiles(this.getBasedir()));
      return this.state.menu.render();
    }
  }, {
    key: 'renderPrompt',
    value: function renderPrompt() {
      return this.prompt.bind(this);
    }
  }]);

  return DirectoriesPage;
})(_page2.default);

exports.default = DirectoriesPage;