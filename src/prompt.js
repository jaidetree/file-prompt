/* eslint no-param-reassign: 0  */
// import readline from 'readline';
import colors from 'chalk';

/**
 * Prompt
 * A class for capturing input from the user
 *
 * @class Prompt
 * @property {string} text - The question text to ask.
 * @property {object} options - Options to use
 */
class Prompt {
  /**
   * Class properties
   */
  text = "";
  options = {
    stdin: process.stdin,
    stdout: process.stdout
  };

  /**
   * Constructor
   * Populates the text based on options
   *
   * @constructor
   * @param {string} text - Prompt text
   * @param {object} options - Options to initialize the prompt with.
   */
  constructor (text, options={}) {
    if (text && typeof text === 'string') {
      this.text = text;
    }

    if (typeof text === 'object') {
      options = text;
      text = null;
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
  beckon (question) {
    if (question) {
      this.text = question;
    }

    // Set the encoding to support more characters from input
    this.options.stdin.setEncoding('utf8');

    // Beckon the question!
    this.options.stdout.write(this.formatText() + this.formatPrompt());

    // Create our promise
    return new Promise((resolve, reject) => {
      let readable = () => {
        let chunk = this.options.stdin.read();

        if (chunk !== null) {
          this.options.stdin.removeListener('readable', readable);
          resolve(chunk.toString().trim());
        }
      };

      // Try asking a question with the readline interface
      try {
        this.options.stdin.removeListener('readable', readable);
        this.options.stdin.on('readable', readable);
      }
      catch (e) {
        // Close the interface
        this.close();
        this.options.stdout.write(e);
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
  close () {
    this.options.stdin.end();
  }

  /**
   * Format Prompt
   * Renders the prompt with some coloring
   *
   * @method
   * @private
   * @returns {string} Returns the prompt string
   */
  formatPrompt () {
    return colors.magenta.bold(' > ');
  }

  /**
   * Format Text
   * Styles the text for the prompt
   *
   * @method
   * @private
   * @returns {string} Colored prompt string
   */
  formatText () {
    return colors.blue.bold(this.text);
  }
}

export default Prompt;
