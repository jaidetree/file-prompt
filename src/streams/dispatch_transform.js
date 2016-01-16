import colors from 'chalk';
import BaseTransform from './base_transform';
import { addFile, removeFile } from '../actions';

export default class Dispatch extends BaseTransform {
  name = 'dispatch';

  /**
   * Constructor
   * Constructs the queries transform class.
   *
   * @constructor
   * @param {object} options - Initialization options
   */
  constructor (options={}) {
    super({ objectMode: true });

    this.action = this.createAction({
      type: 'done',
      data: null,
    });

    if (options.store) this.store = options.store;

    // Throw a temper tantrum
    if (!this.store) throw new Error('BaseDispatcher: No store provided');

    this.on('error', (err) => {
      process.stderr.write((err.stack || err.message) + '\n');
    });
  }

  /**
   * Format Error
   * Stylizes the error string to be red and adds a new line.
   *
   * @method
   * @public
   * @param {string} err - Input error format
   * @returns {string} Formatted error string
   */
  formatError (err) {
    return `${colors.red.bold(err)}\n`;
  }

  /**
   * Process
   * Maps various transform actions into actual actions like selecting files
   * displaying error messages or forwarding to a router.
   *
   * @method
   * @private
   * @param {object} action - Transform action result from input
   */
  process (action) {
    switch (action.type) {
      // Show error messages
      case 'error':
        this.pushAction({
          type: 'error',
          data: this.formatError(action.data),
        });
        break;

      // Select files
      case 'file':
        this.updateFile(action.data, action.params);
        break;

      default:
        this.pushAction({
          type: 'navigate',
          data: action.data.value === null ? 'blank' : action.data.value,
          params: action.params,
        });
        break;
    }
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
   * @param {object} params - Extra params passed into the action
   */
  updateFile ({ type, operation, value }, params) {
    let action = operation === 'unselect' ? removeFile : addFile;

    if (type === 'all' && params.queryCount === 1 && operation === 'select') {
      this.action.type = 'navigate';
      this.action.data = 'all';
    }

    this.store.dispatch(action(value));
  }

  /**
   * Flush
   * Emits a final piece of data to signify a closing action.
   *
   * @param {function} done - Callback to call when finished
   */
  _flush (done) {
    this.push(this.action);

    done();
  }

  /**
   * Transform
   * Transforms actions to be dispatchable actions.
   * We are either going to be navigating, displaying an error.
   *
   * @method
   * @private
   * @param {object} transformAction - Transform action from incoming stream
   * @param {string} enc - Encoding of the transform action
   * @param {function} done - Callback to call when finished writing
   */
  _transform (transformAction, enc, done) {
    /**
     * If the route returns true then we want to skip any then callbacks as
     * that is what is used to reprompt
     */
    this.process(transformAction);

    done();
  }
}
