import { Readable } from 'stream';
class MockStdin extends Readable {
  contents = [];
  cursor = 0;
  closed = false;
  isRaw = true;
  isTTY = true;

  constructor (contents, ...args) {
    super(...args);

    if (contents) {
      this.contents = contents;
    }
  }

  end () {
    if (this.closed) return;
    this.pause();
    this.closed = true;
    this.emit('close');
  }

  setRawMode (mode) {
    this.isRaw = mode;
  }

  _read () {
    let interval = setInterval(() => {
      if (this.cursor >= this.contents.length) {
        this.push(null);
        this.emit('end');
        clearInterval(interval);
        return;
      }
      this.push(new Buffer(this.contents[this.cursor] + '\n', 'ascii').toString());
      this.cursor += 1;
    }, 10);
  }
}

export default MockStdin;
