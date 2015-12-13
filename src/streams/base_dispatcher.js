import colors from 'chalk';
import stripAnsi from 'strip-ansi';
import { addFile, navigate, removeFile } from '../actions';
import { MatchError } from '../errors';
import { Writable } from 'stream';

export default class BaseDispatcher extends Writable {
  name = 'dispatcher';
  filters = {};
  params = {};
  done = null;
  skipThen = false;
  endAction = null;
  _results = [];

  /**
   * Constructor
   * Constructs the queries transform class.
   *
   * @constructor
   * @param {object} options - Initialization options
   */
  constructor (options={}) {
    super({ objectMode: true });

    // a route option is provided then lets add it to our params
    if (options.route) this.params.route = options.route;
    if (options.store) this.store = options.store;

    // Throw a temper tantrum
    if (!this.store) throw new Error('BaseDispatcher: No store provided');

    this.on('error', (err) => {
      process.stderr.write((err.stack || err.message) + '\n');
    });

    // First finish listener
    this.once('finish', () => {
      /**
       * If we are navigating we don't want to be loading any other pages or
       * reprompting so lets remove those listeners.
       */
      if (this.select('currentPage.isNavigating')) {
        this.removeAllListeners('finish');
      }

      if (this.endAction) {
        this.endAction();
        return;
      }
    });

    /**
     * If there is a route param lets call it on finish
     */
    if (typeof this.params.route === 'function') {
      this.once('finish', () => {
        let { creator, type, data, params } = this.getLastResult();

        if (!creator && !data) return;

        if (this.params.route(creator, type, data, params)) {
          this.skipThen = true;
        }
      });
    }
  }

  /**
   * Dispatch
   * Dispatches the targeted action
   *
   * @method
   * @public
   * @param {object} action - Dispatches the given action object
   * @returns {*} The result of the dispatch call
   */
  dispatch (action) {
    return this.store.dispatch(action);
  }

  /**
   * Display Error
   * Displays the error message to the user if there is one
   *
   * @method
   * @param {string} err - Error instance
   * @returns {boolean} false to tell the router not reprompt
   */
  displayError (err) {
    let msg = err.message;

    if (err instanceof MatchError) {
      msg = this.formatError(err.message);
    }

    process.stderr.write(colors.red.bold(msg) + '\n');

    return false;
  }

  /**
   * Finish
   * Tells the dispatcher that we are done dispatching
   *
   * @method
   * @public
   * @returns {*} Whatever a stream _write done callback returns.
   */
  finish () {
    return this.done();
  }

  /**
   * Format Error
   * Formats an error message to display to the user
   *
   * @method
   * @public
   * @param {string} searchFor - Original search param
   * @returns {string} Formatted error message
   */
  formatError (searchFor) {
    let cleanStr = stripAnsi(searchFor).trim();

    if (cleanStr) cleanStr = ` (${cleanStr})`;

    return `Huh${cleanStr}?`;
  }

  /**
   * Get Last Result
   * Returns the last buffered result
   *
   * @method
   * @public
   * @returns {object} Last buffered transform action
   */
  getLastResult () {
    if (!this._results.length) return {};
    return this._results[this._results.length - 1];
  }

  /**
   * Route
   * Maps various transform actions into actual actions like selecting files
   * displaying error messages or forwarding to a subclass router.
   *
   * @method
   * @private
   * @param {object} transformAction - Transform action result from input
   * @param {string} transformAction.creator - Transform action creator
   * @param {string} transformAction.type - Type of data
   * @param {*} transformAction.data - Resulting transformed data
   * @param {object} transformAction.params - Extra transform params & flags
   * @returns {boolean} Returns true if it should skip reprompting
   */
  route ({ type, data, params }) {
    let pageName = this.select('currentPage.name');

    // If not on index page and we get a blank input lets navigate to index
    if (data.operation === 'blank' && pageName !== 'index') {
      this.endAction = () => {
        this.removeAllListeners('finish');
        this.dispatch(navigate('index'));
      };
      return true;
    }

    /**
     * If user has selected just a single '*' then select everything then
     * go back to the index page
     */
    else if (
      data.type
      && data.type === 'all'
      && type === 'file'
      && params.queryCount === 1
      && pageName !== 'index'
      && pageName !== 'directories'
    ) {
      this.endAction = () => {
        this.dispatch(navigate('index'));
        this.removeAllListeners('finish');
      };
      this.updateFile(data);
      return true;
    }

    switch (type) {
      // Show error messages
      case 'error':
        this._results.pop();
        return this.displayError(data);

      // Select files
      case 'file':
        return this.updateFile(data);
    }
  }

  /**
   * Select
   * Selects data form the global app state
   *
   * @method
   * @public
   * @param {string} keystr - Name of the key to get period (.) separated
   * @returns {*} Data stored in the state for that key string
   */
  select (keystr) {
    let result = this.store.getState();

    keystr.split('.').map((key) => {
      result = result[key];
    });

    return result;
  }

  /**
   * Then
   * A callback to execute on completion
   *
   * @method
   * @public
   * @param {function} cb - Callback to call when finished
   */
  then (cb) {
    this.once('finish', () => {
      if (this.select('currentPage.isNavigating')) return;
      if (this.skipThen) return;
      cb(this._results);
    });
  }

  /**
   * Update File
   * Selects or unselects files from the store
   *
   * @method
   * @public
   * @param {object} data - Data to select or unselect a file with
   * @param {string} data.operation - Either "select" or "unselect"
   * @param {string} data.value - Absolute file path to select or unselect
   * @returns {boolean} true if success
   */
  updateFile ({ operation, value }) {
    let action = operation === 'unselect' ? removeFile : addFile;

    this.dispatch(action(value));

    return false;
  }

  /**
   * Write
   * Dispatches the matching store actions based on action creator and type
   *
   * @method
   * @public
   * @param {object} transformAction - Transform action from incoming stream
   * @param {string} enc - Encoding of the transform action
   * @param {function} done - Callback to call when finished writing
   * @returns {*} Return values are ignored
   */
  _write (transformAction, enc, done) {
    this._results.push(transformAction);

    /**
     * If the route returns true then we want to skip any then callbacks as
     * that is what is used to reprompt
     */
    if (this.route(transformAction)) this.skipThen = true;
    this.done = done;

    return this.finish();
  }
}
