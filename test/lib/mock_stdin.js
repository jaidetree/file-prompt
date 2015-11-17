import { Readable } from 'stream';
class MockStdin extends Readable {
  contents = [];
  cursor = 0;
  closed = false;

  constructor (contents, ...args) {
    super(...args);

    if (contents) {
      this.contents = contents;
    }
  }

  close () {
    if (this.closed) return;
    this.pause();
    this.closed = true;
    this.emit('close');
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
