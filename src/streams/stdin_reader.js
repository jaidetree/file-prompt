import TransformAction from '../transform_action';
import { Readable } from 'stream';

/**
 * Stdin Reader
 * Reads from stdin and pushes read input onto the next streams
 *
 * @class
 * @extends {stream.Readable}
 * @property {boolean} hasListeners - Determines if listeners have been set
 * @property {stream.Readable} stdin - Input stream
 * @property {stream.Writable} stdout - Writable stream
 */
export default class StdinReader extends Readable {
  listener = null;
  stdin = process.stdin;
  stdout = process.stdout;

  /**
   * Constructor
   * Initializes this class instance
   *
   * @constructor
   * @param {object} options - Options to initialize the readable stream with
   */
  constructor (options) {
    super({ objectMode: true });

    this.stdin.setEncoding('utf8');

    if (options.stdin) this.stdin = options.stdin;
    if (options.stdout) this.stdout = options.stdout;
  }

  /**
   * Add Listeners
   * Sets the listeners for receiving data and cleaning up when finished
   *
   * @method
   * @public
   */
  addListeners () {
    /**
     * Sets a listener for the data event which is fired when user
     * presses enter after typing stuff
     */
    this.stdin.on('data', (data) => {
      this.push(new TransformAction({
        creator: 'prompt',
        type: 'string',
        data: String(data).trim()
      }));
      this.push(null);
    });

    /**
     * Get the last data listener
     */
    this.listener = this.stdin.listeners('data').pop();

    /**
     * Triggered when we've pushed a null from valid input
     */
    this.once('end', () => {
      /** Remove the last stdin data listener */
      this.stdin.removeListener('data', this.listener);
      this.listener = null;
      this.stdin.pause();
    });
  }

  /**
   * Read
   * Method used to read from the stream
   *
   * @method
   * @private
   */
  _read () {
    if (!this.listener) this.addListeners();
    this.stdin.resume();
  }
}
