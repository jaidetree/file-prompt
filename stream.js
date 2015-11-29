import util from 'util';
import { Readable, Transform, Writable } from 'stream';

/**
 * Generic Transform
 * A test class to expiriment with creating a series of transforms
 *
 * @class
 * @extends {stream.Transform}
 */
class GenericTransform extends Transform {

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
      console.error(err.stack);
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

/**
 * Stdin Reader
 * Reads from stdin and pushes read input onto the next streams
 *
 * @class
 * @extends {stream.Readable}
 */
class StdinReader extends Readable {
  hasListeners = false;

  /**
   * Constructor
   * Initializes this class instance
   *
   * @constructor
   * @param {object} options - Options to initialize the readable stream with
   */
  constructor (options) {
    super(Object.assign({}, { encoding: 'utf8' }, options));
  }

  /**
   * Add Listeners
   * Sets the listeners for receiving data and cleaning up when finished
   *
   * @method
   * @public
   */
  addListeners () {
    let listener;

    /**
     * Sets a listener for the data event which is fired when user
     * presses enter after typing stuff
     */
    process.stdin.on('data', (data) => {
      this.push(data);

      if (String(data).trim()) this.push(null);
    });

    /**
     * Get the last data listener
     */
    listener = process.stdin.listeners('data').pop();

    /**
     * Triggered when we've pushed a null from valid input
     */
    this.once('end', () => {
      /** Remove the last stdin data listener */
      process.stdin.removeListener('data', listener);
      process.stdin.pause();
    });

    this.hasListeners = true;
  }

  /**
   * Read
   * Method used to read from the stream
   *
   * @method
   * @private
   */
  _read () {
    if (!this.hasListeners) this.addListeners();
    process.stdin.resume();
  }
}

/**
 * Stdout Writer
 * Handles writing to stdout including linebreaks. I believe this is
 * required as writing to the stdout stream will not emit end\finish events.
 *
 * @class
 * @extends {stream.Writable}
 */
class StdoutWriter extends Writable {
  constructor (options) {
    super(options);
  }

  /**
   * Write
   * Stream method to write to process.stdout
   *
   * @method
   * @param {buffer} chunk - Text that gets written to the console
   * @param {string} enc - Encoding of the buffer
   * @param {callback} done - Callback to call when finished
   */
  _write (chunk, enc, done) {
    process.stdout.write(String(chunk) + '\n');
    done();
  }
}

/**
 * To
 * A shorthand function to create a generic transform method
 *
 * @method
 * @public
 * @param {function} transformer - transformer(data) returns new data
 * @returns {GenericTransform} A generic transform stream
 */
function to (transformer) {
  return new GenericTransform(transformer);
}

/**
 * Prompt
 * Requests input from the user then transforms it. Ideally it would ask for
 * input. When it receives a line it would stop reading, transform the data
 * then when the stream is finished ask the user for more input.
 *
 * @returns {Promise} A promise when the input has been read, transformed,
 *                    and displayed to the console via process.stdout.write
 */
function prompt () {
  process.stdout.write('Enter some input: ');
  return new Promise((resolve, reject) => {
    /** Start with process.stdin input stream */
    new StdinReader()

      /**
       * Converts the raw string input into a simple object with
       * a contents property and a date property
       *
       * @example
       * > Test
       * > (ctrl-d)
       *  {contents: "Test", date: 43993991013 }
       */
      .pipe(to((chunk) => {
        return {
          contents: String(chunk).trim(),
          date: Date.now()
        };
      }))

      /**
       * Takes the object created from the previous step and formats it as
       * a string using the inspect util. I suppose JSON.stringify would
       * also have worked.
       */
      .pipe(to((obj) => {
        return util.inspect(obj);
      }))

      /**
       * Pipe to a writable stream that writes to stdout. This is necessary
       * because the docs say that stdout never emit finish or end events.
       */
      .pipe(new StdoutWriter())

      /**
       * Handle errors and finish events by either resolving or rejecting
       * the parent promise object.
       */
      .on('finish', resolve)
      .on('error', reject);
  });
}

/** Set the encoding so it all comes in as strings */
process.stdin.setEncoding('utf8');

/**
 * This is the main driver logic for connecting the above pieces. It will
 * input the first question then keeps asking for more input. To stop
 * entering data press ctrl-d to send an EOF to process.stdin. This
 * at least causes the finish event to fire at the end but on the next
 * usage of prompt, everything is done.
 */
prompt()
  .then(prompt)
  .then(() => {
    // process.stdin.destroy();
  });

// let collection = [];

// function read () {
//   process.stdin.on('readable', () => {
//     let line = process.stdin.read();

//     if (line !== null) {
//       collection.push(line);
//       process.stdin.removeListener('readable', process.stdin.listeners('readable')[0]);
//     }
//   });
// }

// read();