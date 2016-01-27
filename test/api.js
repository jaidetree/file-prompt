import fileprompt from '../src';
import expect from 'expect';
import MockStdin from './lib/mock_stdin';
import MockStdout from './lib/mock_stdout';
import path from 'path';

/**
 * Extract the basenames from a list of absolute paths
 *
 * @param {array} files - List of absolute path files
 * @returns {array} List of base files filename.ext from /path/filename.ext
 */
function basenames (files) {
  return files.map((file) => path.basename(file));
}

/**
 * Runs fileprompt and makes sure files are returned then maps them to just
 * their basenames for further testing
 *
 * @param {array} data - List of input data to enter in
 * @returns {Promise} A promise resolved with the basenames of all the files
 */
function getFiles (data=[]) {
  let stdin = new MockStdin(data),
      stdout = new MockStdout();

  return fileprompt({
    stdin,
    stdout,
  })
  .then((files) => {
    expect(files).toExist();
    expect(files).toBeA(Array);
    return basenames(files);
  });
}

describe('FilePrompt', () => {
  describe('directories', () => {
    it('Should select 2 files from the src directory', () => {
      return getFiles(['1', '1 2', '', 'q'])
        .then((files) => {
          expect(files).toEqual(['actions.js', 'app.js']);
        });
    });

    it('Should be able to select all pages', () => {
      return getFiles(['1', 'pages', '*', 'q'])
        .then((files) => {
          expect(files).toEqual([
            'changed_page.js',
            'directories_page.js',
            'files_page.js',
            'glob_page.js',
            'index_page.js',
          ]);
        });
    });

    it('Should be able to select a single page file and select another file from root', () => {
      return getFiles(['1', 'pages', '2', '1', '1', '', 'q'])
        .then((files) => {
          expect(files).toEqual([
            'changed_page.js',
            'actions.js',
          ]);
        });
    });

    it('Select a range of files', () => {
      return getFiles(['1', '1-4', '', 'q'])
        .then((files) => {
          expect(files).toEqual([
            'actions.js',
            'app.js',
            'component.js',
            'index.js',
          ]);
        });
    });

    it('Select a range of files then unselect one of them', () => {
      return getFiles(['1', '1-4', '-3', '', 'q'])
        .then((files) => {
          expect(files).toEqual([
            'actions.js',
            'app.js',
            'index.js',
          ]);
        });
    });
  });

  describe('files', () => {
    it('Should select the first two files', () => {
      return getFiles(['2', '1', '2', '', 'q'])
        .then((files) => {
          expect(files).toEqual(['actions.js', 'app.js']);
        });
    });

    it('Should all the files and return to the main menu', () => {
      return getFiles(['2', '*', 'q'])
        .then((files) => {
          expect(files).toInclude('actions.js');
          expect(files).toInclude('app.js');
        });
    });

    it('Should select all files unselect all files and return to main menu', () => {
      return getFiles(['2', '*', '2', '-*', '', 'q'])
        .then((files) => {
          expect(files).toEqual([]);
        });
    });

    it('Should select 5 files', () => {
      return getFiles(['2', '1 2-4', '5', '', 'q'])
        .then((files) => {
          expect(files).toEqual([
            'actions.js',
            'app.js',
            'component.js',
            'index.js',
            'menu.js',
          ]);
        });
    });
  });

  describe('glob', () => {
    it('Should select 2 files from a glob str', () => {
      return getFiles(['3', '**/*.js', '1 2', '', 'q'])
        .then((files) => {
          expect(files).toEqual(['actions.js', 'app.js']);
        });
    });

    it('Should return to the main menu on blank', () => {
      return getFiles(['3', '', 'q'])
        .then((files) => {
          expect(files).toEqual([]);
        });
    });

    it('Should allow selection and unselection', () => {
      return getFiles(['3', '**/*.js', '*', '3', '**/*.js', '-*', '1-3', '', 'q'])
        .then((files) => {
          expect(files).toEqual([
            'actions.js',
            'app.js',
            'component.js',
          ]);
        });
    });
  });
});
