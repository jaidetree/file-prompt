import expect from 'expect';
import { colors } from 'gulp-util';

import Prompt from '../src/prompt';
import MockStdin from './lib/mock_stdin';
import MockStdout from './lib/mock_stdout';

const DEFINED_METHODS = [
        'constructor',
        'beckon',
        'close',
        'formatPrompt',
        'formatText'
      ],
      PROMPT_TEXT = 'Is this working';

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
      let stdin = new MockStdin(['Test string']),
          stdout = new MockStdout(),
          expected = colors.blue.bold(PROMPT_TEXT),
          prompt = new Prompt(PROMPT_TEXT, {
            stdout,
            stdin
          });

      return prompt.beckon()
        .then((answer) => {
          expect(answer).toBe('Test string');
          stdout.write(answer);
          expect(stdout.output).toBe(`${expected}Test string`);
        }, (e) => {
          throw e;
        })
        .then(done, done);
    });

    it('Should accept an empty response', (done) => {
      let stdin = new MockStdin(['']),
          stdout = new MockStdout(),
          expected = colors.blue.bold(PROMPT_TEXT),
          prompt = new Prompt(PROMPT_TEXT, {
            stdout,
            stdin
          });

      return prompt.beckon()
        .then((answer) => {
          expect(answer).toBe('');
          stdout.write(answer);
          expect(stdout.output).toBe(expected);
        }, (e) => {
          throw e;
        })
        .then(done, done);
    });

    it('Should fail when input stream is closed', (done) => {
      let stdin = new MockStdin(['']),
          stdout = new MockStdout(),
          prompt = new Prompt(PROMPT_TEXT, {
            stdout,
            stdin
          });

      prompt.beckon()
        .catch((err) => {
          expect(err).toBe('Input stream closed.');
        })
        .then(done, done);

      stdin.end();
    });
  });


});
