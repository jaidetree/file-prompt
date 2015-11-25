'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = column;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Column
 * Creates a text column to ensure it takes up the max length characters
 *
 * @param {string} text - Initial content text
 * @param {int} maxLength - Maximum length to fill
 * @returns {string} Column formatted text
 */
function column(text, maxLength) {
  var plainText = _chalk2.default.stripColor(text),
      diff = maxLength - plainText.length,
      spacer = diff > 0 ? ' '.repeat(diff) : '';

  return '' + text + spacer;
}