// import { Readable } from 'stream';
import { Socket } from 'net';

class MockStdin extends Socket {
  contents = [];
  cursor = 0;
  closed = false;
  isRaw = true;
  isTTY = true;
  readable = false;

  constructor (contents, ...args) {
    super(...args);

    if (contents) {
      this.contents = contents;
    }
  }

  get content () {
    return this.contents.join('\n');
  }

  set content (contents) {
    this.end();
    this.closed = false;
    this.contents = contents;
    this.cursor = 0;
  }

  on (...args) {
    let result = super.on(...args);

    if (args[0] === 'readable') {
      // this.readable = true;
      // console.log(this._readableState);
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
      this.emit('readable');
    }

    return result;
  }

  setRawMode (mode) {
    this.isRaw = mode;
  }

  _read () {
    if (this.cursor >= this.contents.length) {
      this.push(null);
      return;
    }
    this.push(new Buffer(this.contents[this.cursor] + '\n', 'ascii').toString());
    this.cursor += 1;
    this.push(null);
  }
}

export default MockStdin;
