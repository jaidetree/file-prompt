'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

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

  /**
   * Get Initial State
   * Returns an object to be used as this component's initial state
   *
   * @method
   * @private
   * @returns {object} Initial component state object
   */

  _createClass(Page, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {
        selected: []
      };
    }

    /**
     * Select items
     * Updates the state with the selected items.
     *
     * @method
     * @public
     * @param {array} options - List of options to select from
     * @param {int|array} selectedIndexes - List of items to select
     * @returns {array} The new list of selected items
     */

  }, {
    key: 'selectItems',
    value: function selectItems(options, selectedIndexes) {
      var selected = [],
          chosen = selectedIndexes;

      /**
       * Error
       * A reusble function to throw an error
       */
      function error() {
        throw new Error('Error:Page.selectItems: Page could not select items ' + selectedIndexes.toString() + '.');
      }

      // If chosen is an array, format them all as numbers
      if (chosen && Array.isArray(chosen) && chosen.length) {
        // Convert the selectedIndexes into an array of numeric indexes
        chosen = chosen.map(function (item) {
          return Number(item);
        });

        // Filter the options into what was selected
        selected = options.filter(function (option, index) {
          return chosen.indexOf(index) > -1;
        });

        // Make sure our selected length is not empty.
        if (selected.length === 0) error();
      }

      // If the selected indexes exists but is not an array
      else if (typeof chosen === 'string' || typeof chosen === 'number') {
          // Convert the selected index into a number
          if (typeof chosen === 'string') {
            chosen = Number(chosen);
          }

          // Attempt to push it into the selected array otherwise throw an error
          if (!options[chosen]) {
            error();
          }

          selected.push(options[chosen]);
        }

      // Finally update the state then return the newly selected items.
      this.setState({
        selected: selected
      });

      return selected;
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

      return content.join('');
    }
  }]);

  return Page;
})(_component2.default);

exports.default = Page;