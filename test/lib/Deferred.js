/**
 * Deferred is a simple way to use promises in a slightly cleaner style.
 * @extends Promise
 */
export default class Deferred {
  /**
   * Initializes the deferred interface.
   *
   * @param {*} resolvedValue - A value to immediately resolve with.
   */
  constructor (resolvedValue) {
    this._promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      if (resolvedValue) resolve(resolvedValue);
    });

    this.callback = this.callback.bind(this);
  }

  /**
   * Returns the promise interface for this deferred promise
   *
   * @returns {Promise} Deferred promise instance
   */
  promise () {
    return this._promise;
  }

  /**
   * Generic callback function to deal with the standard callback function
   *
   * @param {*} err - Error from the resulting async function callback
   * @param {*} result - Value that gets resolved from successful async action
   * @returns {null} Returns null from either rejecting or resolving
   */
  callback (err, result) {
    if (err) return this.reject(err);
    return this.resolve(result);
  }
}
