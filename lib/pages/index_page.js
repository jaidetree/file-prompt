'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _menu = require('../menu');

var _menu2 = _interopRequireDefault(_menu);

var _page = require('../page');

var _page2 = _interopRequireDefault(_page);

var _prompt = require('../prompt');

var _prompt2 = _interopRequireDefault(_prompt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MENU_OPTIONS = [{
  id: 1,
  label: 'Directories',
  key: 'd'
}, {
  id: 2,
  label: 'Files',
  key: 'f'
}, {
  id: 3,
  label: 'Glob string',
  key: 'g'
}, {
  id: 4,
  label: 'Changed from git',
  key: 'c'
}];

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

  /**
   * Get Default Props
   * Returns the default properties for this component. Can be overridden
   * by a subclass
   *
   * @method
   * @privae
   * @returns {object} Default IndexPage props
   */

  _createClass(IndexPage, [{
    key: 'getDefaultProps',
    value: function getDefaultProps() {
      return {
        menu: new _menu2.default({
          options: MENU_OPTIONS
        }),
        prompt: new _prompt2.default()
      };
    }
  }, {
    key: 'renderIntro',
    value: function renderIntro() {
      return _chalk2.default.white.bold(this.intro) + '\n';
    }
  }, {
    key: 'renderPrompt',
    value: function renderPrompt() {
      return this.props.prompt.beckon(this.question).then(function (answer) {
        console.log(answer);
      });
    }
  }, {
    key: 'renderMenu',
    value: function renderMenu() {
      return this.props.menu.render();
    }
  }]);

  return IndexPage;
})(_page2.default);

exports.default = IndexPage;