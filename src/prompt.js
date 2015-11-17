/* eslint no-magic-numbers: 0  */
import readline from 'readline';
import { colors } from 'gulp-util';

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
  options = {};

  /**
   * Constructor
   * Populates the text based on options
   *
   * @constructor
   * @param {string} text - Prompt text
   * @param {object} options - Options to initialize the prompt with.
   */
  constructor (text, options={}) {
    this.text = text;

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
   * @returns {Promise} - Returns an ES6 promise object
   */
  beckon () {
    // Create the readline interface
    let rl = this.rl = readline.createInterface({
      input: this.options.stdin || process.stdin,
      output: this.options.stdout || process.stdout
    });

    // Create our promise
    return new Promise((resolve, reject) => {
      // Try asking a question with the readline interface
      try {
        // Set the prompt character to be cool
        rl.setPrompt(this.formatPrompt());

        // Just ask the question ok node?
        rl.question(this.formatText(), (answer) => {
          this.close();

          // Cool we got an answer so lets send it back
          resolve(answer);
        });

        // Setup some close handlers just in case
        rl.once('close', this.close);

        // Make sure that when the process exits we clean up after ourselves
        process.once('exit', this.close);
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
    this.rl.close();
    this.options.stdin.destroy();
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
