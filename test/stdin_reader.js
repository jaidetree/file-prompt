import expect from 'expect';

import StdinReader from '../src/streams/stdin_reader.js';

import MockStdin from './lib/mock_stdin';
import through from 'through2';

describe('Stdin Reader', () => {
  describe('constructor', () => {
    it('Should initialize', () => {
      let stdinReader = new StdinReader();

      expect(stdinReader).toBeA(StdinReader);
    });

    it('Should support optional stdin and stdout values', () => {
      let stdin = 'stdin',
          stdout = 'stdout',
          stdinReader = new StdinReader({
            stdin,
            stdout,
          });

      expect(stdinReader.stdin).toBe('stdin');
      expect(stdinReader.stdout).toBe('stdout');
    });
  });

  describe('#addListeners()', () => {
    it('Should add a data listener', () => {
      let stdin = new MockStdin(),
          stdinReader = new StdinReader({
            stdin,
          }),
          listeners;

      stdinReader.addListeners();

      listeners = stdin.listeners('data');

      expect(listeners).toBeA(Array);
      expect(listeners.length).toBe(1);
    });

    it('Should add a an end listener', () => {
      let stdin = new MockStdin(),
          stdinReader = new StdinReader({
            stdin,
          }),
          listeners;

      stdinReader.addListeners();

      listeners = stdin.listeners('end');

      expect(listeners).toBeA(Array);
      expect(listeners.length).toBe(1);
    });
  });

  describe('#read()', () => {
    it('Should read a line of input then end', (done) => {
      let stdin = new MockStdin(['hello world', 'what is up']),
          reader = new StdinReader({
            stdin,
          });

      reader
        .pipe(through.obj((data, enc, next) => {
          expect(data.creator).toBe('prompt');
          expect(data.type).toBe('string');
          expect(data.data).toBe('hello world');
          expect(data.timestamp).toBeA('number');

          next(null, data);
        }))
        .on('finish', () => {
          done();
        });
    });

    it('Should handle multiple reads', () => {
      let stdin = new MockStdin(['hello world', 'what is up']),
          testsRun = 0;

      return new Promise((resolve) => {
        let reader = new StdinReader({
          stdin,
        });

        reader
          .pipe(through.obj((data, enc, next) => {
            expect(data.creator).toBe('prompt');
            expect(data.type).toBe('string');
            expect(data.data).toBe('hello world');
            expect(data.timestamp).toBeA('number');

            testsRun += 1;

            next(null, data);
          }))
          .on('finish', resolve);
      })
      .then(() => {
        let reader = new StdinReader({
          stdin,
        });

        return new Promise((resolve) => {
          reader
            .pipe(through.obj((data, enc, next) => {
              expect(data.creator).toBe('prompt');
              expect(data.type).toBe('string');
              expect(data.data).toBe('what is up');
              expect(data.timestamp).toBeA('number');

              testsRun += 1;

              next(null, data);
            }))
            .on('finish', resolve);
        });
      })
      .then(() => {
        expect(testsRun).toBe(2);
        return;
      })
      .catch((err) => console.error(err.stack || err.message || err));
    });
  });
});
