'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fileprompt;

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * File Prompt
 * Props for files with the given options
 *
 * @param {object} options - Initial options
 * @param {string} options.basedir - Base directory to search in
 * @param {string} options.filter - Glob filter for files and git diff files
 * @returns {Promise} A promise when files have been selected or rejected on
 *                    error.
 */
function fileprompt() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var app = new _app2.default(Object.assign({
    basedir: __dirname
  }, options));

  app.props.stdout.write('\n');
  _app2.default.mount(app);

  return new Promise(function (resolve, reject) {
    app.once('complete', resolve);
    app.once('error', reject);
  });
}