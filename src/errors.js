/**
 * Extendable Error
 * @class
 */
export class ExtendableError extends Error {

  /**
   * Constructor
   * Initializes the error class
   *
   * @constructor
   * @param {string} message - Error message to display
   */
  constructor (message, ...args) {
    super(message, ...args);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * Match Error
 * Fired when no menu options match the given input
 *
 * @class
 * @extends {@error}
 */
export class MatchError extends ExtendableError {
  constructor (...args) {
    super(...args);
  }
}
