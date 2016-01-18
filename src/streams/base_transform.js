import bindMethods from '../util/bind_methods';
import stripAnsi from 'strip-ansi';
import TransformAction from '../transform_action';
import { Transform } from 'stream';

/**
 * Generic Transform
 * A test class to expiriment with creating a series of transforms
 *
 * @class
 * @extends {stream.Transform}
 * @property {object} filters - Hash of filters to test the input against
 */
export default class BaseTransform extends Transform {
  filters = {};
  params = {};
  name = 'BaseTransform';

  /**
   * Constructor
   * Initializes the transform constructor
   *
   * @constructor
   * @param {object} [options] - Stream constructor options
   */
  constructor (options) {
    super({ objectMode: true });

    if (typeof this.getParams === 'function') {
      Object.assign(this.params, this.getParams(options));
    }

    /** Manually bind the given methods to this instance for convienence */
    bindMethods(this, 'errorHandler');

    this.setListeners();
  }

  /**
   * Create Action
   * Creates a transform action instance
   *
   * @method
   * @public
   * @param {object} data - Initial data to push
   * @returns {TransformAction} A new transform action
   */
  createAction (data) {
    if (!data.creator) data.creator = this.name;

    return new TransformAction(data);
  }

  /**
   * Error Handler
   * Default handler for stream errors
   *
   * @method
   * @public
   * @param {Error} err - Caught exception error instance
   */
  errorHandler (err) {
    process.stderr.write(`${err.stack || err.message}\n`);
    process.exit(1);
  }

  /**
   * Filter Data
   * Predicate to determine if the incoming chunk matches the filters of this
   * transformation.
   *
   * @method
   * @public
   * @param {object} filters - Object containing filtered props and values
   * @param {object} chunk - Raw input read from input stream
   * @returns {boolean} If the chunk matches the given filter
   */
  filterData (filters, chunk) {
    return Object.keys(filters).every((name) => {
      return filters[name] === chunk[name];
    });
  }

  /**
   * Match Error
   * Pushes a match error down the stream. This is used when the raw input
   * is invalid or no matches were found.
   *
   * @method
   * @public
   * @param {string} searchFor - Original query value
   */
  matchError (searchFor) {
    let err = stripAnsi(searchFor.toString()).trim();

    /** Format the match error */
    if (err) err = ` (${err})`;
    err = `Huh${err}?`;

    this.pushError(err);
  }

  /**
   * Push Action
   * Pushes an action down the stream
   *
   * @method
   * @public
   * @param {object} data - Action data to push
   * @param {object} options - Extra options and flags
   */
  pushAction (data) {
    this.push(this.createAction(data));
  }

  /**
   * Push Error
   *
   * @method
   * @public
   * @param {Error} err - Error instance to push down the stream
   */
  pushError (err) {
    this.pushAction({
      type: 'error',
      data: err,
    });
  }

  /**
   * Set Listeners
   * Sets any necessary listeners such as an error handler. Can be overridden
   * in a subclass.
   *
   * @method
   * @private
   */
  setListeners () {
    this.on('error', this.errorHandler);
  }

  /**
   * Transform
   * Transforms the incoming data and returns the new output
   *
   * @method
   * @public
   * @param {object} input - Original input read from the incoming stream
   */
  transform (input) {
    this.push(input);
  }

  /**
   * Transform
   * Stream method to transform read data, transform it, then move it to the
   * next stream.
   *
   * @method
   * @param {buffer} chunk - Buffer read from the input stream
   * @param {string} enc - Encoding of the input stream chunk buffer
   * @param {function} done - Callback to fire when transform is complete
   * @returns {*} Result of the done callback
   */
  _transform (chunk, enc, done) {
    try {
      // Filter the chunk and see if we should be transforming it at all
      if (!this.filterData(this.filters, chunk)) return done(null, chunk);
      this.transform(chunk);
      return done();
    }
    catch (e) {
      this.emit('error', e);
      done();
    }
  }
}
