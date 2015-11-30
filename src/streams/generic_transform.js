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
    this.on('error', (err) => {
      process.stderr.write(err.stack + '\n');
      process.exit(0);
    });
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
      this.push(this._transformCallback(chunk, this));
      done();
    }
    catch (e) {
      this.emit('error', e);
      done();
    }
  }
}
