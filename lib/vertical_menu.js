'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _menu = require('./menu');

var _menu2 = _interopRequireDefault(_menu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MAX_COLUMN_WIDTH = 6;

/**
 * VerticalMenu
 * Represents a selection of menu options. This class shows a list of
 * horizontal main menu options in columns.
 *
 * @class VerticalMenu
 * @extends {Menu}
 */

var VerticalMenu = (function (_Menu) {
  _inherits(VerticalMenu, _Menu);

  /**
   * Constructor
   * Initializes the menu component
   *
   * @constructor
   * @param {object} props - Initial component properties
   */

  function VerticalMenu(props) {
    _classCallCheck(this, VerticalMenu);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(VerticalMenu).call(this, props));
  }

  /**
   * Render Column
   * Render the column.
   *
   * @method
   * @public
   * @param {string} text - Column text
   * @returns {string} Column padded string
   */

  _createClass(VerticalMenu, [{
    key: 'renderColumn',
    value: function renderColumn(text) {
      var plainText = _chalk2.default.stripColor(text),
          offset = MAX_COLUMN_WIDTH - plainText.length,
          spacer = ' '.repeat(offset);

      return '' + text + spacer;
    }

    /**
     * Render Option
     * Render the menu option
     *
     * @method
     * @public
     * @param {object} option - The option to render
     * @returns {string} Formatted option
     */

  }, {
    key: 'renderOption',
    value: function renderOption(option) {
      var selected = ' ';

      if (option.isSelected) {
        selected = '*';
      }

      return selected + ' ' + this.renderColumn(option.id + ':') + ' ' + option.label + '\n';
    }
  }]);

  return VerticalMenu;
})(_menu2.default);

exports.default = VerticalMenu;