import { Writable } from 'stream';

class MockStdout extends Writable {
  output = "";
  isTTY = true;

  constructor (...args) {
    super(...args);
  }

  toString () {
    return this.output.toString();
  }

  _write (chunk, enc, next) {
    this.output += chunk.toString();
    next();
  }
}

export default MockStdout;
