import { Writable } from 'stream';

export default class Dispatcher extends Writable {
  name = 'final_write';

  /**
   * Constructor
   * Constructs the queries transform class.
   *
   * @constructor
   * @param {function} cb - Callback to call on each transform action
   * @param {object} options - Initialization options
   */
  constructor (cb, options={}) {
    super({ objectMode: true });
    this.options = options;
    this.cb = cb;
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
   */
  _write (transformAction, enc, done) {
    this.cb(this, transformAction);

    done();
  }
}
