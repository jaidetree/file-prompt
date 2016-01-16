import expect from 'expect';
import IndexPage from '../src/pages/index_page';
import MockStdout from './lib/mock_stdout';
import MockStdin from './lib/mock_stdin';
import StoreFactory from './factories/store';

let stdout = new MockStdout();

/**
 * Creates a page instance with a mock stdin, stdout, and store
 *
 * @param {array} data - Initial data for mockstdin to emit
 * @returns {Page} Initialized page instance
 */
function createPage (data=[]) {
  return new IndexPage({
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

  describe('#constructor()', () => {
    it('Should exist', () => {
      expect(IndexPage).toExist();
    });

    it('Should produce an IndexPage', () => {
      let store = StoreFactory.create();

      expect(new IndexPage({ store })).toBeA(IndexPage);
    });

    it('Should support input & output props', () => {
      let page = createPage(['Hello World']);

      expect(page.menu.props.stdin).toBe(page.props.stdin);
      expect(page.menu.props.stdout).toBe(page.props.stdout);
      expect(page.prompt.options.stdin).toBe(page.props.stdin);
      expect(page.prompt.options.stdout).toBe(page.props.stdout);
    });

  });

  describe('#quit()', () => {
    it('Should emit a complete event', () => {
      let page = createPage(),
          spy = expect.createSpy();

      page.on('complete', spy);
      page.quit();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#route()', () => {
    it('Should reprompt on blank responses', () => {
      let page = createPage(),
          stream = new MockStdout(),
          spy = expect.spyOn(page, 'reprompt');

      page.route(stream, {
        type: 'navigate',
        data: 'blank',
      });

      expect(spy).toHaveBeenCalled();
    });

    it('Should call quit on a quit response', () => {
      let page = createPage(),
          stream = new MockStdout(),
          spy = expect.spyOn(page, 'quit');

      page.route(stream, {
        type: 'navigate',
        data: 'quit',
      });

      expect(spy).toHaveBeenCalled();
    });

    it('Should call showHelp on a help response', () => {
      let page = createPage(),
          stream = new MockStdout(),
          spy = expect.spyOn(page, 'showHelp');

      page.route(stream, {
        type: 'navigate',
        data: 'help',
      });

      expect(spy).toHaveBeenCalled();
    });

    it('Should call navigate on a general navigate response', () => {
      let page = createPage(),
          stream = new MockStdout(),
          spy = expect.spyOn(page, 'navigate');

      page.route(stream, {
        type: 'navigate',
        data: 'files',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('files');
    });

    it('Should reprompt when stream is done', () => {
      let page = createPage(),
          stream = new MockStdout(),
          spy = expect.spyOn(page, 'reprompt');

      page.route(stream, {
        type: 'done',
        data: null,
      });

      expect(spy).toHaveBeenCalled();
    });

    it('Should show an error message on error response', () => {
      let page = createPage(),
          stream = new MockStdout(),
          spy = expect.spyOn(page, 'displayError');

      page.route(stream, {
        type: 'error',
        data: 'Error message',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('Error message');
    });
  });

  describe('#showHelp()', () => {
    it('Should write out a help message to stdout', () => {
      let page = createPage();

      page.showHelp();

      expect(page.props.stdout.toString()).toBe('\x1b[1m\x1b[31mHELP\n  directories - Select files & browse directories\n  files       - Select from a list of all nested files\n  glob        - Input a glob string then selected from matches\n  changed     - Select files from git diff --name-only\n  help        - Uhhh... this thing I guess...\n  quit        - Forward files along\n\x1b[39m\x1b[22m');
    });
  });

  describe('#showPrompt()', () => {
    it('Should display the prompt', () => {
      let page = createPage('quit');

      page.showPrompt()
        .on('finish', () => {
          expect(page.props.stdout.toString()).toBe('\x1b[34m\x1b[1mWhat do you seek?\x1b[22m\x1b[39m\x1b[35m\x1b[1m > \x1b[22m\x1b[39m');
        });
    });
  });

  describe('#workflow()', () => {
    it('Should return a workflow object', () => {
      let page = createPage(),
          workflow = page.workflow();

      expect(workflow.query).toExist();
      expect(workflow.menu).toExist();
      expect(workflow.dispatch).toExist();
    });
  });

  describe('#renderIntro()', () => {
    it('Should display intro text', () => {
      let page = createPage();

      expect(page.renderIntro()).toBe('\x1b[37m\x1b[1m*** COMMANDS ***\x1b[22m\x1b[39m\n');
    });

    it('Should dispaly files if present', () => {
      let page = createPage();

      page.props.store.dispatch({ type: 'ADD_FILE', file: __filename });
      expect(page.renderIntro()).toBe('\n1:     test/index_page.js\n\n\x1b[37m\x1b[1m*** COMMANDS ***\x1b[22m\x1b[39m\n');
    });
  });

  describe('#renderPrompt()', () => {
    it('Should return showPrompt method', () => {
      let page = createPage();

      expect(page.renderPrompt()).toBe(page.showPrompt);
    });
  });

  describe('#renderMenu()', () => {
    it('Should render the menu', () => {
      let page = createPage();

      expect(page.renderMenu()).toBe('  1: \x1b[35m\x1b[1md\x1b[22m\x1b[39mirectories       2: \x1b[35m\x1b[1mf\x1b[22m\x1b[39miles             3: \x1b[35m\x1b[1mg\x1b[22m\x1b[39mlob              4: \x1b[35m\x1b[1mc\x1b[22m\x1b[39mhanged         \n  5: \x1b[35m\x1b[1mh\x1b[22m\x1b[39melp              6: \x1b[35m\x1b[1mq\x1b[22m\x1b[39muit            \n');
    });
  });

  describe('#render()', () => {
    it('Should render the intro, menu, and prompt', () => {
      let page = createPage(),
          output;

      IndexPage.mount(page);

      output = page.props.stdout.toString();

      expect(output).toBe('\x1b[37m\x1b[1m*** COMMANDS ***\x1b[22m\x1b[39m\n  1: \x1b[35m\x1b[1md\x1b[22m\x1b[39mirectories       2: \x1b[35m\x1b[1mf\x1b[22m\x1b[39miles             3: \x1b[35m\x1b[1mg\x1b[22m\x1b[39mlob              4: \x1b[35m\x1b[1mc\x1b[22m\x1b[39mhanged         \n  5: \x1b[35m\x1b[1mh\x1b[22m\x1b[39melp              6: \x1b[35m\x1b[1mq\x1b[22m\x1b[39muit            \n\x1b[34m\x1b[1mWhat do you seek?\x1b[22m\x1b[39m\x1b[35m\x1b[1m > \x1b[22m\x1b[39m');
    });
  });
});

