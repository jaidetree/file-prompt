import fs from 'fs';
import gutil from 'gulp-util';
import path from 'path';

let stdoutWrite = process.stdout._write;

/**
 * Stdout Interceptor
 * Allows us to temporarily prevent and capture output to the stdout console
 * which helps us test the console log.
 *
 * @class
 * @property {array} output - Collection of captured output
 */
export default class StdoutInterceptor {

  /**
   * Constructor
   * Initializes the class properties
   *
   * @constructor
   */
  constructor () {
    this.flush();
  }

  /**
   * Capture
   * Overwrites node's write method on the stdout
   *
   * @method
   * @public
   */
  capture () {
    this.output = [];

    process.stdout._write = (chunk, enc, callback) => {
      this.output.push(chunk);
      callback();
    };
  }

  /**
   * Flush
   * Flushes the output
   *
   * @method
   */
  flush () {
    this.output = [];
  }

  /**
   * Release
   * Stop capturing the output
   *
   * @method
   * @returns {string} A cleaned up colorless output
   */
  release () {
    process.stdout._write = stdoutWrite;
    return gutil.colors.stripColor(this.toString().trim());
  }

  /**
   * To String
   * Returns the concatenated output
   *
   * @method
   * @public
   * @returns {string} Captured output string
   */
  toString () {
    return this.output.join('');
  }

  /**
   * Write File
   * Writes output to file
   *
   * @method
   * @public
   * @param {string} [filename] - Optional filename to write to
   * @returns {Promise} a promise called when the file is written.
   */
  writeFile (filename) {
    let content = this.toString(),
        filepath = filename;

    /** Create output directory in dir if not specified */
    if (!filepath) {
      filepath = path.resolve(__dirname, '..', '..', 'output', 'console.log');
    }

    /** Return a promise for when the file is written */
    return new Promise((resolve, reject) => {
      try {
        fs.writeFile(filename, content, (err) => {
          if (err) {
            reject(err);
          }

          resolve(filename, content);
        });
      }
      catch (e) {
        reject(e);
      }
    });
  }
}
