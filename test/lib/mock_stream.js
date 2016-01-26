import expect from 'expect';
import { Duplex } from 'stream';

/**
 * Mock Stream
 * A generic stream for testing streams with
 *
 * @class MockStream
 * @extends {Duplex}
 * @property {array} [data] - Internal data buffer to read from
 * @property {int} index - Cursor position of internal read data buffer
 * @property {array} input - Collected input from write
 * @property {array} output - Collected input from read
 * @property {object} spies - Spy instances to help test streams
 */
export default class MockStream extends Duplex {
  data = null;
  index = -1;
  input = [];
  output = [];
  spies = {
    read: expect.createSpy(),
    write: expect.createSpy(),
    push: expect.createSpy(),
  };

  /**
   * @constructor
   * @param {array} data - Queue of data the readable stream should read from
   */
  constructor (data=null) {
    super({ objectMode: true });

    this.once('finish', () => {
      this.push(null);
    });

    if (Array.isArray(data) && data.length) this.data = data;
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
   * Feed data into the data buffer
   *
   * @param {array} data - More data to feed the internal data buffer with
   */
  feed (data) {
    this.data = this.data.concat(data);
  }

  /**
   * Returns the first item for the given key
   *
   *
   * @param {string} name - Input or output
   * @returns {*} The first collected input or output entry
   */
  first (name='output') {
    return this[name][0];
  }

  /**
   * Returns concated stream from the named buffer input or output
   *
   * @param {string} name - Name of the buffer to return "input" or "output"
   * @returns {string} All data stored in the buffer
   */
  get (name='output') {
    return this[name].join('');
  }

  /**
   * Calls the push spy and pushes the data down the readable stream
   *
   * @param {...*} args - Arguments to log and push down the stream
   * @returns {Boolean} True if the writable destination wants more data
   */
  push (...args) {
    this.output.push(args[0]);
    this.emit('write', ...args);
    this.spies.push(...args);
    return super.push(...args);
  }

  /**
   * Resets the internal index used for reading from our data
   */
  reset () {
    this.index = -1;
  }

  /**
   * Required duplex implementation for reading data. Normally this does
   * nothing unless data was sent to the constructor
   *
   * @param {...*} args - Read arguments from stream api interface
   */
  _read (...args) {
    if (this.data && this.index < this.data.length) {
      this.spies.read(...args);
      this.index += 1;
      this.push(this.data[this.index]);
    }
    else if (this.data && this.index === this.data.length) {
      this.push(null);
    }
  }

  /**
   * Required duplex implementation for writing data. By default this is kind
   * of a pass through\transform stream and pushes whatever input it gets
   * down the readable end.
   *
   * @param {*} data - Any type of data object
   * @param {string} enc - Encoding type. Not really used for object streams
   * @param {function} next - Callback to fire when done writing data
   */
  _write (data, enc, next) {
    // Store the input in our public buffer
    this.input.push(data);
    this.emit('read', data);

    // Log the data to our spy
    this.spies.write(data, enc, next);

    // Send data down the stream and notify the stream we are done writing
    this.push(data);
    next();
  }
}
