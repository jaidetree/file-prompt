import expect from 'expect';
import GlobPage from '../src/pages/glob_page';
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
  return new GlobPage({
    store: StoreFactory.create(store),
    stdin: new MockStdin(data),
    stdout,
  });
}

describe('GlobPage', () => {
  describe('#createOptionsFrom()', () => {
    it('Should return array of options', () => {
      let page = createPage(),
          options = page.createOptionsFrom([
            __filename,
          ]);

      expect(options).toBeA(Array);
      expect(options.length).toBe(1);
      expect(options[0].id).toBe(1);
      expect(options[0].isSelected).toBe(false);
      expect(options[0].label).toBe('test/glob_page.js');
      expect(options[0].name).toBe(__filename);
      expect(options[0].value).toBe(__filename);
    });
  });

  describe('#getFiles()', () => {
    it('Should return an array of files', () => {
      let page = createPage(),
          files = page.getFiles('src/pages/**/*.js');

      expect(files).toBeA(Array);
      expect(files.length).toBe(5);
    });
  });

  describe('#processGlob()', () => {
    it('Should return files matching glob', () => {
      let page = createPage(),
          stream = new MockStream();

      page.processGlob(stream, {
        creator: 'prompt',
        type: 'string',
        data: 'src/pages/**/*.js',
      });

      expect(page.state.files).toBeA(Array);
      expect(page.state.files.length).toBe(5);
    });

    it('Should navigate to index on empty input', () => {
      let page = createPage(),
          stream = new MockStream(),
          action;

      page.processGlob(stream, {
        creator: 'prompt',
        type: 'string',
        data: '',
      });

      action = stream.first();

      expect(action.type).toBe('navigate');
      expect(action.data.value).toBe('blank');
    });

    it('Should push an error if no files match the glob', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.createSpy();

      stream.pushError = spy;

      page.processGlob(stream, {
        creator: 'prompt',
        type: 'string',
        data: '**/*.jsbad',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('No files matched the glob string "**/*.jsbad"');
    });
  });

  describe('#question()', () => {
    it('Should ask to enter the glob initially', () => {
      let page = createPage();

      expect(page.question()).toBe('Enter glob from file-prompt');
    });

    it('Should ask for files after a glob is entered', () => {
      let page = createPage();

      page.setState({ files: [__filename] });
      expect(page.question()).toBe('Add files');
    });
  });

  describe('#route()', () => {
    it('Should navigate to index on blank responses', () => {
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

    it('Should navigate to index when all items are selected', () => {
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

    it('Should display error actions', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'displayError');

      page.route(stream, {
        type: 'error',
        data: 'Error was raised',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('Error was raised');
    });
  });

  describe('#workflow()', () => {
    it('Should have glob and dispatch by default', () => {
      let page = createPage(),
          workflow = page.workflow();

      expect(workflow.glob).toExist();
      expect(workflow.dispatch).toExist();
    });

    it('Should have query, menu, and dispatch when files present', () => {
      let page = createPage(),
          workflow;

      page.setState({ files: [__filename] });

      workflow = page.workflow();

      expect(workflow.query).toExist();
      expect(workflow.menu).toExist();
      expect(workflow.dispatch).toExist();
    });
  });

  describe('#renderMenu()', () => {
    it('Should display no menu by default', () => {
      let page = createPage();

      expect(page.renderMenu()).toBe('');
    });

    it('Should display a menu when files are added', () => {
      let page = createPage();

      page.setState({ files: [__filename] });
      expect(page.renderMenu()).toBe('  1:     test/glob_page.js\n');
    });
  });
});
