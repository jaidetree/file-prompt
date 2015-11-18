'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /* eslint no-magic-numbers: 0  */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Prompt
 * A class for capturing input from the user
 *
 * @class Prompt
 * @property {string} text - The question text to ask.
 * @property {object} options - Options to use
 */

var Prompt = (function () {

  /**
   * Constructor
   * Populates the text based on options
   *
   * @constructor
   * @param {string} text - Prompt text
   * @param {object} options - Options to initialize the prompt with.
   */

  /**
   * Class properties
   */

  function Prompt(text) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Prompt);

    this.text = "";
    this.options = {};

    if (text) {
      this.text = text;
    }

    if (options) {
      this.options = Object.assign(this.options, options);
    }
  }

  /**
   * Beckon
   * Asks a prompt and returns a promise that will be resolved on an answer
   * and rejected upon an error or no answer;
   *
   * @method
   * @public
   * @param {string} question - The question to beckon
   * @returns {Promise} - Returns an ES6 promise object
   */

  _createClass(Prompt, [{
    key: 'beckon',
    value: function beckon(question) {
      var _this = this;

      // Create the readline interface
      var rl = this.rl = _readline2.default.createInterface({
        input: this.options.stdin || process.stdin,
        output: this.options.stdout || process.stdout
      });

      if (question) {
        this.text = question;
      }

      // Create our promise
      return new Promise(function (resolve, reject) {
        // Try asking a question with the readline interface
        try {
          _this.options.stdin.on('end', function () {
            _this.close();
            reject('Input stream closed.');
          });

          // Set the prompt character to be cool
          rl.setPrompt(_this.formatPrompt());

          // Just ask the question ok node?
          rl.question(_this.formatText(), function (answer) {
            _this.close();

            // Cool we got an answer so lets send it back
            resolve(answer);
          });

          // Setup some close handlers just in case
          rl.once('close', _this.close);

          // Make sure that when the process exits we clean up after ourselves
          process.once('exit', _this.close);
        } catch (e) {
          // Close the interface
          _this.close();
          _this.options.stdout.write(e);
          reject(e);
        }
      });
    }

    /**
     * Close
     * Close the readline interface if open.
     *
     * @method
     * @public
     */

  }, {
    key: 'close',
    value: function close() {
      if (!this.rl) return;
      process.removeListener('exit', this.close);
      this.rl.close();
      this.options.stdin.close();
    }

    /**
     * Format Prompt
     * Renders the prompt with some coloring
     *
     * @method
     * @private
     * @returns {string} Returns the prompt string
     */

  }, {
    key: 'formatPrompt',
    value: function formatPrompt() {
      return _chalk2.default.magenta.bold(' > ');
    }

    /**
     * Format Text
     * Styles the text for the prompt
     *
     * @method
     * @private
     * @returns {string} Colored prompt string
     */

  }, {
    key: 'formatText',
    value: function formatText() {
      return _chalk2.default.blue.bold(this.text);
    }
  }]);

  return Prompt;
})();

exports.default = Prompt;