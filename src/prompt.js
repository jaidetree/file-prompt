/* eslint no-param-reassign: 0  */
import colors from 'chalk';
import StdinReader from './streams/stdin_reader';

/**
 * Prompt
 * A class for capturing input from the user
 *
 * @class Prompt
 * @property {string} text - The question text to ask.
 * @property {object} options - Options to use
 */
export default class Prompt {
  /**
   * Class properties
   */
  text = "";
  options = {
    stdin: process.stdin,
    stdout: process.stdout,
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
   * @returns {stream.Readable} - Returns a readable stream
   */
  beckon (question) {
    if (question) this.text = question;

    // Set the encoding to support more characters from input
    this.options.stdin.setEncoding('utf8');

    // Beckon the question!
    this.options.stdout.write(this.formatText() + this.formatPrompt());

    return new StdinReader(this.options);
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
