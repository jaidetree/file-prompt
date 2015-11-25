'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _column = require('../util/column');

var _column2 = _interopRequireDefault(_column);

var _menu = require('../menu');

var _menu2 = _interopRequireDefault(_menu);

var _page = require('../page');

var _page2 = _interopRequireDefault(_page);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _prompt = require('../prompt');

var _prompt2 = _interopRequireDefault(_prompt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MENU_OPTIONS = [{
  id: 1,
  label: 'directories',
  name: 'directories',
  value: 'directories'
}, {
  id: 2,
  label: 'files',
  name: 'files',
  value: 'files'
}, {
  id: 3,
  label: 'glob',
  name: 'glob',
  value: 'glob'
}, {
  id: 4,
  label: 'changed',
  name: 'changed',
  value: 'changed'
}, {
  id: 5,
  label: 'help',
  name: 'help',
  value: 'help'
}, {
  id: 6,
  label: 'quit',
  name: 'quit',
  value: 'quit'
}],
    MAX_LABEL_WIDTH = 6,
    MAX_HELP_WIDTH = 11;

/**
 * Index Page
 * The main menu page of our CLI app
 *
 * @class IndexPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */

var IndexPage = (function (_Page) {
  _inherits(IndexPage, _Page);

  /**
   * Constructor
   * Initializes this page's subclass
   *
   * @constructor
   * @param {object} props - Properties to initialize the class with
   */

  function IndexPage(props) {
    _classCallCheck(this, IndexPage);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IndexPage).call(this, props));

    _this.intro = '*** COMMANDS ***';
    _this.question = 'What do you seek?';
    return _this;
  }

  _createClass(IndexPage, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {
        prompt: new _prompt2.default({
          stdin: this.props.stdin,
          stdout: this.props.stdout
        }),
        menu: new _menu2.default({
          options: MENU_OPTIONS,
          stdin: this.props.stdin,
          stdout: this.props.stdout,
          app: this.props.app
        })
      };
    }

    /**
     * Prompt
     * Beckons the prompt
     *
     * @method
     * @public
     * @returns {Promise} Returns a promise object chained to the prompt
     */

  }, {
    key: 'prompt',
    value: function prompt() {
      var _this2 = this;

      var reprompt = function reprompt() {
        _this2.props.stdout.write(_this2.renderIntro());
        _this2.props.stdout.write(_this2.renderMenu());
        _this2.prompt();
      };

      return this.state.prompt.beckon(this.question).then(this.processInput.bind(this)).then(function (results) {
        var item = results.selectedItems[0];

        switch (item.value) {
          case 'quit':
            _this2.quit();
            break;

          case 'help':
            _this2.showHelp();
            reprompt();
            break;

          case null:
            reprompt();
            break;

          default:
            _this2.navigate(item.value);
            break;
        }

        return results;
      }).catch(function (e) {
        reprompt();
        throw e;
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
      return this.state.menu.find(answer, function (queries) {
        return queries.slice(0, 1);
      });
    }

    /**
     * Quit
     * Closes the app and writes a goodbye message.
     */

  }, {
    key: 'quit',
    value: function quit() {
      if (this.props.app) {
        this.props.app.emit('complete', this.select('files'));
      }
      this.props.stdin.pause();
    }

    /**
     * Show Help
     * Displays the instructions for this app
     *
     * @method
     * @public
     */

  }, {
    key: 'showHelp',
    value: function showHelp() {
      var help = {
        directories: 'Select files & browse directories',
        files: 'Select from a list of all nested files',
        glob: 'Input a glob string then selected from matches',
        changed: 'Select files from git diff --name-only',
        help: 'Uhhh... this thing I guess...',
        quit: 'Forward files along'
      },
          text = 'HELP\n';

      for (var name in help) {
        if (help.hasOwnProperty(name)) {
          var content = help[name];

          text += (0, _column2.default)(name, MAX_HELP_WIDTH) + ' - ' + content + '\n';
        }
      }

      this.props.stdout.write(_chalk2.default.bold.red(text));
    }

    /**
     * Render Intro
     * Displays the list of files if any are selected
     *
     * @method
     * @public
     * @returns {string} Intro text to display
     */

  }, {
    key: 'renderIntro',
    value: function renderIntro() {
      var text = '',
          files = this.select('files'),
          basedir = this.select('config.basedir');

      // Build our list of files
      if (files.length) {
        text += '\n';

        files.forEach(function (file, i) {
          var relative = _path2.default.relative(basedir, file),
              label = i + 1 + ': ';

          label = (0, _column2.default)(label, MAX_LABEL_WIDTH);

          // 1: src/path/to/file.js
          text += label + ' ' + relative + '\n';
        });

        text += '\n';
      }

      text += _chalk2.default.white.bold(this.intro) + '\n';

      return text;
    }
  }, {
    key: 'renderPrompt',
    value: function renderPrompt() {
      return this.prompt.bind(this);
    }
  }, {
    key: 'renderMenu',
    value: function renderMenu() {
      return this.state.menu.render() + '\n';
    }
  }]);

  return IndexPage;
})(_page2.default);

exports.default = IndexPage;