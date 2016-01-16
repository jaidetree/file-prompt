import expect from 'expect';
import DirectoriesPage from '../src/pages/directories_page';
import MockStdout from './lib/mock_stdout';
import MockStdin from './lib/mock_stdin';
import MockStream from './lib/mock_stream';
import path from 'path';
import StoreFactory from './factories/store';

let stdout = new MockStdout();

const DATA = {};

DATA.base = path.resolve(__dirname, '..', 'src');
DATA.dir = path.resolve(__dirname, '..', 'src', 'pages');

/**
 * Creates a page instance with a mock stdin, stdout, and store
 *
 * @param {array} data - Initial data for mockstdin to emit
 * @returns {Page} Initialized page instance
 */
function createPage (data=[]) {
  return new DirectoriesPage({
    store: StoreFactory.create(),
    stdin: new MockStdin(data),
    stdout,
  });
}

describe('Index Page', () => {
  afterEach(() => {
    stdout.flush();
    expect.restoreSpies();
  });

  describe('#getFiles()', () => {
    it('Should return a list of files', () => {
      let page = createPage(),
          files = page.getFiles('**/*.js', DATA.dir);

      expect(files).toBeA(Array);
      expect(files.length).toBe(6);
      expect(files.map((item) => item.name)).toEqual([
        '..',
        'changed_page.js',
        'directories_page.js',
        'files_page.js',
        'glob_page.js',
        'index_page.js',
      ]);
    });
  });

  describe('#processFiles()', () => {
    it('Should push regular files', () => {
      let page = createPage(),
          stream = new MockStream();

      page.processFile(stream, {
        type: 'test',
        data: {},
      });

      expect(stream.spies.push).toHaveBeenCalled();
    });

    it('Should change the page state selected dir on single directory', () => {
      let page = createPage(),
          stream = new MockStream();

      page.processFile(stream, {
        type: 'file',
        data: {
          value: DATA.dir,
          type: 'single',
        },
        params: {
          queryCount: 1,
        },
      });

      expect(page.state.targetDir).toBe(DATA.dir);
      expect();
    });

    it('Should not change the page if data type is not a single directory', () => {
      let page = createPage(),
          stream = new MockStream();

      page.processFile(stream, {
        type: 'file',
        data: {
          value: DATA.dir,
        },
        params: {
          queryCount: 1,
        },
      });

      expect(page.state.targetDir).toBe(null);
    });
  });

  describe('#route()', () => {
    it('Should navigate to index on blank responses', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'navigate');

      page.route(stream, { type: 'navigate', data: 'blank' });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('index');
    });

    it('Should navigate to index on all', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'navigate');

      page.route(stream, { type: 'navigate', data: 'all' });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('index');
    });

    it('Should navigate to target dir', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'navigate');

      page.processFile(stream, {
        type: 'file',
        data: {
          value: DATA.dir,
          type: 'single',
        },
        params: {
          queryCount: 1,
        },
      });

      page.route(stream, { type: 'navigate', data: null });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('directories', { base: DATA.dir });
    });

    it('Should call reprompt on done', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'reprompt');

      page.route(stream, { type: 'done', data: null });

      expect(spy).toHaveBeenCalled();
    });

    it('Should display an error on error data', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'displayError');

      page.route(stream, { type: 'error', data: 'Error Message' });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('Error Message');
    });
  });

  describe('#workflow()', () => {
    it('Should return a workflow object', () => {
      let page = createPage(),
          workflow = page.workflow();

      expect(workflow.query).toExist();
      expect(workflow.menu).toExist();
      expect(workflow.process).toExist();
      expect(workflow.dispatch).toExist();
    });
  });

  describe('#renderMenu()', () => {
    it('Should render the menu for src files', () => {
      let page = createPage();

      page.props.store.dispatch({
        type: 'SET_CONFIG',
        config: {
          base: DATA.dir,
        },
      });

      expect(page.renderMenu()).toBe('  1:     changed_page.js\n  2:     directories_page.js\n  3:     files_page.js\n  4:     glob_page.js\n  5:     index_page.js\n');
    });
  });
});
