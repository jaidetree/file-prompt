import { Transform } from 'stream';

/**
 * Generic Transform
 * A test class to expiriment with creating a series of transforms
 *
 * @class
 * @extends {stream.Transform}
 */
export default class GenericTransform extends Transform {

  /**
   * Constructor
   * Initializes the transform constructor
   *
   * @constructor
   * @param {function} transformCallback - Transformer function
   * @param {object} [options] - Stream constructor options
   */
  constructor (transformCallback, options={}) {
    super(Object.assign({}, options, { objectMode: true }));
    this._transformCallback = transformCallback;
  }

  /**
   * Destroys the transform with an optional err param
   *
   * @param {string} err - Reason for destroying the stream from error
   */
  destroy (err) {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    process.nextTick(() => {
      if (err) this.emit('error', err);

      this.emit('close');
    });
  }

  /**
   * Push Error
   *
   * @method
   * @public
   * @param {Error} err - Error instance to push down the stream
   */
  pushError (err) {
    this.push({
      creator: 'generic-transformer',
      type: 'error',
      data: err,
    });
    this.push(null);
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
   */
  _transform (chunk, enc, done) {
    try {
      this._transformCallback(this, chunk);
      done();
    }
    catch (e) {
      this.emit('error', e);
      done();
    }
  }
}
