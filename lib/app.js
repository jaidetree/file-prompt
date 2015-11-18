'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _index_page = require('./pages/index_page');

var _index_page2 = _interopRequireDefault(_index_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * App
 * The whole application component
 *
 * @class App
 */

var App = (function (_Component) {
  _inherits(App, _Component);

  /**
   * Constructor
   * Initiates the class instance
   *
   * @constructor
   * @param {object} props - Initial props
   */

  function App(props) {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));
  }
  /**
   * Pages
   * A collection of pages mapped to things
   *
   * @static
   * @public
   */

  _createClass(App, [{
    key: 'getDefaultProps',
    value: function getDefaultProps() {
      return {
        comlink: new _events2.default(),
        initialPage: 'index'
      };
    }
  }, {
    key: 'getInitialState',
    value: function getInitialState() {
      var initialPage = this.props.initialPage,
          page = null;

      if (initialPage) {
        page = this.getPage(initialPage);
      }

      return {
        page: page,
        files: []
      };
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.props.comlink.on('app:navigate', this.navigate);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.props.comlink.off('app:navigate', this.navigate);
    }

    /**
     * Get Page
     * Returns the requested page instance
     *
     * @method
     * @public
     * @param {string} pageName - Name of the page to get
     * @returns {Page} Returns a page subclass instance
     */

  }, {
    key: 'getPage',
    value: function getPage(pageName) {
      if (!App.PAGES.hasOwnProperty(pageName)) {
        throw new Error('App: Page does not exist “' + pageName + '”.');
      }

      return new App.PAGES[pageName]({
        comlink: this.props.comlink
      });
    }

    /**
     * Navigate
     * Sets the page state to the requested page name
     *
     * @method
     * @public
     * @param {string} pageName - Name of the page to navigate to
     */

  }, {
    key: 'navigate',
    value: function navigate(pageName) {
      this.setState({
        page: this.getPage(pageName)
      });

      _component2.default.display(this);
    }

    /**
     * Render
     * Displays the current page and lets it do its thing
     *
     * @method
     * @public
     * @returns {string} Returns the rendered page string
     */

  }, {
    key: 'render',
    value: function render() {
      if (!this.state.page) return '';

      return this.state.page.render();
    }
  }]);

  return App;
})(_component2.default);

App.PAGES = {
  index: _index_page2.default
};
exports.default = App;