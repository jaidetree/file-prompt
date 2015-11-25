import fileprompt from '../src';
import expect from 'expect';
import MockStdin from './lib/mock_stdin';
import MockStdout from './lib/mock_stdout';
import path from 'path';
import StdoutInterceptor from './lib/stdout_interceptor';

describe('FilePrompt', () => {
  it('Should prompt for files in the src directory', (done) => {
    let stdin = new MockStdin(['2', '1 2', '', 'q']),
        stdout = new MockStdout();


    fileprompt({
      stdin,
      stdout
    })
    .then((files) => {
      expect(files).toExist();
      expect(files).toBeA(Array);
      expect(files.map((file) => path.basename(file))).toEqual(['actions.js', 'app.js']);
    })
    .then(done, done);
  });
});

