import expect from 'expect';
import IndexPage from '../src/pages/index_page';
import MockStdout from './lib/mock_stdout';
import MockStdin from './lib/mock_stdin';
import StdoutInterceptor from './lib/stdout_interceptor';
import StoreFactory from './factories/store';

let stdout = new MockStdout();

describe('Index Page', () => {
  afterEach(() => {
    stdout.flush();
    expect.restoreSpies();
  });

  after(() => {
    process.stdin.end();
  });

  describe('#constructor()', () => {
    it('Should exist', () => {
      expect(IndexPage).toExist();
    });

    it('Should produce an IndexPage', () => {
      expect(new IndexPage()).toBeA(IndexPage);
    });

    it('Should support input & output props', () => {
      let stdin = new MockStdin(['Hello world']),
          page = new IndexPage({
            stdin,
            stdout
          });

      expect(page.state.menu.props.stdin).toBe(stdin);
      expect(page.state.menu.props.stdout).toBe(stdout);
      expect(page.state.prompt.options.stdin).toBe(stdin);
      expect(page.state.prompt.options.stdout).toBe(stdout);
    });

  });

  describe('#render()', () => {
    it('Should render the intro, menu, and prompt', () => {
      let ceptor = new StdoutInterceptor(),
          store = StoreFactory.create(),
          page = new IndexPage({
            stdin: new MockStdin(['Test string']),
            stdout,
            store
          }),
          output;

      ceptor.capture();
      IndexPage.mount(page);
      ceptor.release();

      output = ceptor.toString();

      expect(output.toString()).toBe('\x1b[37m\x1b[1m*** COMMANDS ***\x1b[22m\x1b[39m\n  1: \x1b[35m\x1b[1md\x1b[22m\x1b[39mirectories      2: \x1b[35m\x1b[1mf\x1b[22m\x1b[39miles            3: \x1b[35m\x1b[1mg\x1b[22m\x1b[39mlob             4: \x1b[35m\x1b[1mc\x1b[22m\x1b[39mhanged        \n  5: \x1b[35m\x1b[1mh\x1b[22m\x1b[39melp             6: \x1b[35m\x1b[1mq\x1b[22m\x1b[39muit           \n');
    });
  });

  describe('#prompt()', () => {
    it('Should respond to numbers', (done) => {
      let stdin = new MockStdin(['1']),
          store = StoreFactory.create(),
          page = new IndexPage({
            stdin,
            stdout,
            store
          });

      page.prompt()
        .then((results) => {
          expect(results).toExist();
          expect(results.selectedItems).toBeA(Array);
          expect(results.selectedItems[0].value).toBe('directories');
        })
        .then(done, done);


      stdin.emit('readable');
    });

    it('Should respond to negative numbers with error and reprompt', (done) => {
      let stdin = new MockStdin(['-1']),
          store = StoreFactory.create(),
          page = new IndexPage({
            stdin,
            stdout,
            store
          });

      page.prompt()
        .catch((e) => {
          expect(e).toExist();
          expect(stdout.toString()).toBe('\x1b[34m\x1b[1mWhat do you seek?\x1b[22m\x1b[39m\x1b[35m\x1b[1m > \x1b[22m\x1b[39m\x1b[31m\x1b[1mHuh (-1)? \n\x1b[22m\x1b[39m\x1b[37m\x1b[1m*** COMMANDS ***\x1b[22m\x1b[39m\n  1: \x1b[35m\x1b[1md\x1b[22m\x1b[39mirectories      2: \x1b[35m\x1b[1mf\x1b[22m\x1b[39miles            3: \x1b[35m\x1b[1mg\x1b[22m\x1b[39mlob             4: \x1b[35m\x1b[1mc\x1b[22m\x1b[39mhanged        \n  5: \x1b[35m\x1b[1mh\x1b[22m\x1b[39melp             6: \x1b[35m\x1b[1mq\x1b[22m\x1b[39muit           \n\x1b[34m\x1b[1mWhat do you seek?\x1b[22m\x1b[39m\x1b[35m\x1b[1m > \x1b[22m\x1b[39m');
          stdin.pause();
        })
        .then(done, done);

      stdin.emit('readable');
    });

    it('Should navigate to the files page with 2', (done) => {
      let stdin = new MockStdin(['2']),
          store = StoreFactory.create(),
          page = new IndexPage({
            stdin,
            stdout,
            store
          });

      page.prompt()
        .then((results) => {
          expect(results).toExist();
          expect(results.selectedItems).toBeA(Array);
          expect(results.selectedItems[0].value).toBe('files');
          expect(store.select('currentPage.name')).toBe('files');
        })
        .then(done, done);

      stdin.emit('readable');
    });

    it('Should navigate to the files page with f', (done) => {
      let stdin = new MockStdin(['f']),
          store = StoreFactory.create(),
          page = new IndexPage({
            stdin,
            stdout,
            store
          });

      page.prompt()
        .then((results) => {
          expect(results).toExist();
          expect(results.selectedItems).toBeA(Array);
          expect(results.selectedItems[0].value).toBe('files');
          expect(store.select('currentPage.name')).toBe('files');
        })
        .then(done, done);

      stdin.emit('readable');
    });

    it('Should show help content', (done) => {
      let stdin = new MockStdin(['help']),
          store = StoreFactory.create(),
          page = new IndexPage({
            stdin,
            stdout,
            store
          });

      page.prompt()
        .then((results) => {
          expect(results).toExist();
          expect(results.selectedItems).toBeA(Array);
          expect(results.selectedItems[0].value).toBe('help');
          expect(stdout.toString()).toInclude('HELP');
        })
        .then(done, done);

      stdin.emit('readable');
    });

    it('Should exit on quit', (done) => {
      let stdin = new MockStdin(['q']),
          store = StoreFactory.create(),
          page = new IndexPage({
            stdin,
            stdout,
            store
          }),
          spy = expect.spyOn(page, 'quit').andCallThrough();

      page.prompt()
        .then((results) => {
          expect(results).toExist();
          expect(results.selectedItems).toBeA(Array);
          expect(results.selectedItems[0].value).toBe('quit');
          expect(stdout.toString()).toInclude('Done.');
          expect(spy).toHaveBeenCalled();
        })
        .then(done, done);

      stdin.emit('readable');
    });

    it('Should catch an error on *', (done) => {
      let stdin = new MockStdin(['*']),
          store = StoreFactory.create(),
          page = new IndexPage({
            stdin,
            stdout,
            store
          });

      page.prompt()
        .catch((e) => {
          expect(e).toExist();
          expect(stdout.toString()).toInclude('Huh (*)?');
        })
        .then(done, done);

      stdin.emit('readable');
    });
  });

});

