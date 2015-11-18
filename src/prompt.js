/* eslint no-magic-numbers: 0  */
import readline from 'readline';
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
  beckon (question) {
    // Create the readline interface
    let rl = this.rl = readline.createInterface({
      input: this.options.stdin,
      output: this.options.stdout
    });

    if (question) {
      this.text = question;
    }

    // Create our promise
    return new Promise((resolve, reject) => {
      // Try asking a question with the readline interface
      try {
        this.options.stdin.once('end', () => {
          this.close();
          reject('Input stream closed.');
        });

        // Set the prompt character to be cool
        rl.setPrompt(this.formatText() + this.formatPrompt());

        rl.on('line', (line) => {
          resolve(line.trim());
        });

        this.options.stdout.write('\n');

        // Setup some close handlers just in case
        rl.once('close', this.close);

        // Make sure that when the process exits we clean up after ourselves
        process.once('exit', this.close);

        // Beckon that prompt!
        rl.prompt();
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
    if (!this.rl) return;
    process.removeListener('exit', this.close);
    // this.rl.close();
    // this.options.stdin.end();
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
