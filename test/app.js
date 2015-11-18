import expect from 'expect';
import Component from '../src/component';
import App from '../src/app';
import StdoutInterceptor from './lib/stdout_interceptor';

const DEFINED_METHODS = [
  'constructor',
  'getDefaultProps',
  'getInitialState',
  'componentWillMount',
  'componentWillUnmount',
  'getPage',
  'navigate',
  'render'
];

class TestComponent extends Component {
  render () {
    return 'Hello world';
  }
}

App.PAGES.test = TestComponent;

describe('App', () => {
  afterEach(() => {
    expect.restoreSpies();
  });

  describe('#PAGES', () => {
    it('Should exist', () => {
      expect(App.PAGES).toExist();
    });

    it('Should not be an empty object', () => {
      expect(App.PAGES).toNotEqual({});
    });

  });

  describe('#constructor()', () => {
    it('Should exist', () => {
      expect(App).toExist();
    });

    it('Should create an app instance', () => {
      expect(new App()).toBeA(App);
    });

    it('Should have methods defined', () => {
      expect(Reflect.ownKeys(App.prototype)).toEqual(DEFINED_METHODS);
    });

    it('Should render the index page by default', () => {
      let app = new App({
            initialPage: 'index'
          }),
          ceptor = new StdoutInterceptor();

      ceptor.capture();
      Component.mount(app);
      ceptor.release();

      expect(ceptor.toString()).toBe('\x1b[37m\x1b[1m*** COMMANDS ***\x1b[22m\x1b[39m\n  1: \x1b[35m\x1b[1md\x1b[22m\x1b[39mirectories      2: \x1b[35m\x1b[1mf\x1b[22m\x1b[39miles            3: \x1b[35m\x1b[1mg\x1b[22m\x1b[39mlob             4: \x1b[35m\x1b[1mc\x1b[22m\x1b[39mhanged        \n  5: \x1b[35m\x1b[1mh\x1b[22m\x1b[39melp             6: \x1b[35m\x1b[1mq\x1b[22m\x1b[39muit           \n\x1b[34m\x1b[1mWhat do you seek?\x1b[22m\x1b[39m\x1b[35m\x1b[1m > \x1b[22m\x1b[39m');
    });

  });

  describe('#navigate()', () => {
    it('Should update the component state', () => {
      let app = new App();

      app.navigate('test');
      expect(app.state.page).toExist();
      expect(app.state.page).toBeA(TestComponent);
    });

    it('Should throw an error if the page does not exist', () => {
      let app = new App();

      expect(() => {
        app.navigate('fake');
      }).toThrow(Error, 'App: Page does not exist “fake”.');
    });

    it('Should render the selected page', () => {
      let spy = expect.spyOn(App.prototype, 'render').andCallThrough(),
          app = new App(),
          ceptor = new StdoutInterceptor(),
          output;

      ceptor.capture();
      Component.mount(app);
      ceptor.flush();
      app.navigate('test');
      ceptor.release();
      output = ceptor.toString();

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(2);
      expect(output).toExist();
      expect(output).toBe('Hello world\n');
    });
  });


});

