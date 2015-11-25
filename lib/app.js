'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _redux = require('redux');

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Read Dir
 * Reads the directory and filters all the matching files to the glob
 *
 * @param {string} dir - Name of the dir to read
 * @param {string} glob - Glob string to filter the files against
 * @returns {object} A hash of indexes to their imported file class
 */
function readDir(dir, glob) {
  var files = {},
      mm = new _minimatch2.default.Minimatch(glob);

  _fs2.default.readdirSync(dir)
  // Filter out the ones that don't match the glob
  .filter(mm.match, mm)
  // For each match lets append it to our files object
  .forEach(function (file) {
    var name = _path2.default.basename(file, '_page.js');

    files[name] = require(_path2.default.resolve(__dirname, dir, file)).default;
  });

  return files;
}

/**
 * Select Current Page
 * Selects the current page data from the store.
 *
 * @param {object} store - Redux data store
 * @returns {object} currentPage object
 */
function selectCurrentPage(store) {
  return store.getState().currentPage;
}

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

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, props));

    _this.store = (0, _redux.createStore)(_reducers2.default, {
      config: {
        base: _this.props.base
      },
      files: [],
      filter: _this.props.filter,
      currentPage: {
        name: 'index',
        props: {}
      }
    });
    return _this;
  }

  /**
   * Get Default Props
   * Returns the default properties object for this component instance
   *
   * @method
   * @private
   * @returns {object} Default component properties
   */

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
        base: process.cwd(),
        filter: '**/*.js',
        stdin: process.stdin,
        stdout: process.stdout
      };
    }
  }, {
    key: 'getInitialState',
    value: function getInitialState() {
      return {
        pageName: null,
        pageProps: null
      };
    }

    /**
     * Component Will Mount
     * Mounts the component
     *
     * @method
     * @private
     */

  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      var currentPage = selectCurrentPage(this.store);

      this.once('complete', function () {
        _this2.componentWillUnmount();
      }, this);

      this.once('error', function () {
        _this2.componentWillUnmount();
      }, this);

      this.setState({
        pageName: currentPage.name,
        pageProps: currentPage.props
      });
    }

    /**
     * Component Will Mount
     * Subscribes to the store for changes and updates the display when
     * the page changes.
     *
     * @method
     * @private
     */

  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      this.unsubscribe = this.store.subscribe(function () {
        var currentPage = selectCurrentPage(_this3.store);

        if (currentPage.is_navigating) {
          _this3.setState({
            pageName: currentPage.name,
            pageProps: currentPage.props
          });
          _component2.default.display(_this3);
          _this3.store.dispatch((0, _actions.navigateComplete)());
        }
      });
    }

    /**
     * Component Will Unmount
     * Component will be removed from display
     *
     * @method
     * @public
     */

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.off();
      this.unsubscribe();
    }

    /**
     * Render Page
     * Returns the requested page instance
     *
     * @method
     * @public
     * @returns {string} Returns a rendered page
     */

  }, {
    key: 'renderPage',
    value: function renderPage() {
      var props = {
        app: this,
        store: this.store,
        stdin: this.props.stdin,
        stdout: this.props.stdout
      };

      if (!App.PAGES.hasOwnProperty(this.state.pageName)) {
        throw new Error('App: Page does not exist “' + this.state.pageName + '”.');
      }

      // If we have extra props called from navigate send those in
      if (this.state.pageProps) {
        Object.assign(props, this.state.pageProps);
      }

      return new App.PAGES[this.state.pageName](props).render();
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
      return this.renderPage();
    }
  }]);

  return App;
})(_component2.default);

App.PAGES = readDir(_path2.default.join(__dirname, 'pages'), '*_page.js');
exports.default = App;