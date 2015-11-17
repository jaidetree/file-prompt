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
  'navigate',
  'render',
  'renderComponent'
];

let ceptor = new StdoutInterceptor();

class TestComponent extends Component {
  render () {
    return 'Hello world';
  }
}

App.PAGES = {
  test: TestComponent
};

describe('App', () => {
  afterEach(() => {
    ceptor.flush();
    ceptor.release();
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
          output;

      ceptor.flush();
      ceptor.capture();
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

