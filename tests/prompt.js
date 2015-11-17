import expect from 'expect';
import stream from 'stream';
import { colors } from 'gulp-util';

import Prompt from 'src/prompt';

const DEFINED_METHODS = [
        'constructor',
        'beckon',
        'close',
        'formatPrompt',
        'formatText'
      ],
      PROMPT_TEXT = 'Is this working';

class MockStdin extends stream.Readable {
  constructor (...args) {
    super(...args);
  }

  destroy () {
    if (this.destroyed) return false;

    this.destroyed = true;
    this.emit('destroy');
    this.close();
    return true;
  }

  close () {
    this.pause();
    this.removeAllListeners();
    this.emit('close');
  }

  _read () {
    this.push(new Buffer('Test string\n', 'ascii').toString());
  }
}

class MockStdout extends stream.Writable {
  output = [];

  constructor (...args) {
    super(...args);
  }

  _write (chunk, enc, next) {
    this.emit('data', chunk);
    next();
  }
}

describe('Prompt', () => {
  describe('#constructor()', () => {
    it('Should exist', () => {
      expect(Prompt).toExist();
    });

    it('Should create a prompt instance', () => {
      let prompt = new Prompt(PROMPT_TEXT);

      expect(prompt).toBeA(Prompt);
    });

    it('Should have methods', () => {
      expect(Reflect.ownKeys(Prompt.prototype)).toEqual(DEFINED_METHODS);
    });

    it('Should have properties', () => {
      let prompt = new Prompt(PROMPT_TEXT);

      expect(prompt.text).toBe(PROMPT_TEXT);
    });
  });

  describe('#formatPrompt()', () => {
    it('Should return a string', () => {
      let prompt = new Prompt(PROMPT_TEXT),
          output = prompt.formatPrompt(),
          expected = colors.magenta.bold(' > ');

      expect(output).toBeA('string');
      expect(output).toBe(expected);
    });

  });

  describe('#formatText()', () => {
    it('Should return a string', () => {
      let prompt = new Prompt(PROMPT_TEXT),
          output = prompt.formatText(),
          expected = colors.blue.bold(PROMPT_TEXT);

      expect(output).toBeA('string');
      expect(output).toBe(expected);
    });

  });

  describe('#beckon()', () => {
    it('Should prompt the user for input', (done) => {
      let stdin = new MockStdin(),
          stdout = new MockStdout(),
          prompt;

      prompt = new Prompt(PROMPT_TEXT, {
        stdout,
        stdin
      });

      prompt.beckon()
        .then((answer) => {
          prompt.close();
          expect(answer).toBe('Test string');
        }, (e) => {
          throw e;
        })
        .then(done, done);
    });

  });


});


