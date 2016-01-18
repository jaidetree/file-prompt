import expect from 'expect';
import FilesPage from '../src/pages/files_page';
import MockStdout from './lib/mock_stdout';
import MockStdin from './lib/mock_stdin';
import MockStream from './lib/mock_stream';
import StoreFactory from './factories/store';

let stdout = new MockStdout();

/**
 * Creates a page instance with a mock stdin, stdout, and store
 *
 * @param {array} data - Initial data for mockstdin to emit
 * @param {object} [store={}] - Store data to initialize with
 * @returns {Page} Initialized page instance
 */
function createPage (data=[], store={}) {
  return new FilesPage({
    store: StoreFactory.create(store),
    stdin: new MockStdin(data),
    stdout,
  });
}

describe('FilesPage', () => {
  describe('#getFiles()', () => {
    it('Should return a list of files', () => {
      let page = createPage(),
          files = page.getFiles('src/**/*.js');

      expect(files).toBeA(Array);
      expect(files.length).toBe(26);
    });
  });

  describe('#route()', () => {
    it('Should navigate to index when blank', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'navigate');

      page.route(stream, {
        type: 'navigate',
        data: 'blank',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('index');
    });

    it('Should navigate to index on all', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'navigate');

      page.route(stream, {
        type: 'navigate',
        data: 'all',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('index');
    });

    it('Should reprompt when done', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'reprompt');

      page.route(stream, {
        type: 'done',
        data: null,
      });

      expect(spy).toHaveBeenCalled();
    });

    it('Should display error when errors happen', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'displayError');

      page.route(stream, {
        type: 'error',
        data: null,
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#renderMenu()', () => {
    it('Should display menu options', () => {
      let page = createPage([], { glob: 'src/pages/**/*.js' });

      expect(page.renderMenu()).toBe('  1:     src/pages/changed_page.js\n  2:     src/pages/directories_page.js\n  3:     src/pages/files_page.js\n  4:     src/pages/glob_page.js\n  5:     src/pages/index_page.js\n');
    });
  });
});

