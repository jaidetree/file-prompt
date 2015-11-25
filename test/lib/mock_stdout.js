import { Socket } from 'net';

class MockStdout extends Socket {
  output = "";
  isTTY = true;
  writeable = true;

  constructor (...args) {
    super(...args);
  }

  flush () {
    this.output = "";
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
