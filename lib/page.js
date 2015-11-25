'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Page
 * A single UI page
 *
 * @class
 */

var Page = (function (_Component) {
  _inherits(Page, _Component);

  /**
   * Constructor
   * Initializes the page class
   *
   * @constructor
   * @param {object} props - Contains this instance's initial properties
   */

  function Page(props) {
    _classCallCheck(this, Page);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Page).call(this, props));
  }

  _createClass(Page, [{
    key: 'getDefaultProps',
    value: function getDefaultProps() {
      return {
        stdin: process.stdin,
        stdout: process.stdout
      };
    }

    /**
     * Get Initial State
     * Returns an object to be used as this component's initial state
     *
     * @method
     * @private
     * @returns {object} Initial component state object
     */

  }, {
    key: 'getInitialState',
    value: function getInitialState() {
      return {
        selected: []
      };
    }

    /**
     * Dispatch
     * Dispatches the targeted action
     *
     * @method
     * @public
     * @param {object} action - Dispatches the given action object
     * @returns {*} The result of the dispatch call
     */

  }, {
    key: 'dispatch',
    value: function dispatch(action) {
      return this.props.store.dispatch(action);
    }

    /**
     * Navigate
     * Navigates to another page
     *
     * @method
     * @public
     * @param {string} page - Target page name to navigate to
     * @param {object} props - Extra props to pass into the next page
     */

  }, {
    key: 'navigate',
    value: function navigate(page) {
      var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.dispatch((0, _actions.navigate)(page, props));
    }

    /**
     * Select
     * Selects data form the global app state
     *
     * @method
     * @public
     * @param {string} keystr - Name of the key to get period (.) separated
     * @returns {*} Data stored in the state for that key string
     */

  }, {
    key: 'select',
    value: function select(keystr) {
      var result = this.props.store.getState();

      keystr.split('.').map(function (key) {
        result = result[key];
      });

      return result;
    }

    /**
     * Render
     * Returns a string with the rendered content
     *
     * @method
     * @content
     * @returns {string} Content to render
     */

  }, {
    key: 'render',
    value: function render() {
      var content = [];

      if (this.renderIntro) {
        content.push(this.renderIntro());
      }

      if (this.renderMenu) {
        content.push(this.renderMenu());
      }

      if (this.renderPrompt) {
        content.push(this.renderPrompt());
      }

      return content;
    }
  }]);

  return Page;
})(_component2.default);

exports.default = Page;