/**
 * Component Class Unit Test
 */
import EventEmitter from 'events';
import Component from '../../src/component';
import StdoutInterceptor from '../lib/stdout_interceptor';
import expect from '../../gulp/node_modules/expect';

const DEFINED_METHODS = [
  'constructor',
  'componentDidMount',
  'componentDidUpdate',
  'componentShouldUpdate',
  'componentWillMount',
  'componentWillUnmount',
  'componentWillUpdate',
  'getDefaultProps',
  'getInitialState',
  'forceUpdate',
  'listenTo',
  'listenToOnce',
  'off',
  'on',
  'remove',
  'render',
  'renderComponent',
  'set',
  'setProps',
  'setState',
  'stopListening'
];

let ceptor = new StdoutInterceptor(),
    TESTFLAGS = {
      captureFromRender: true,
      delayRender: false
    },
    comlink = new EventEmitter();

/**
 * We are creating a test component because the component class is not intended
 * to be instantiated directly
 */
class TestComponent extends Component {
  componentDidMount () {
    super.componentWillMount();
    comlink.emit('componentDidMount');
  }

  componentDidUpdate (...args) {
    super.componentWillUpdate(...args);
    comlink.emit('componentDidUpdate', Date.now(), ...args);
  }

  componentShouldUpdate (...args) {
    let output = super.componentShouldUpdate(...args);

    comlink.emit('componentShouldUpdate', output, ...args);
    return output;
  }

  componentWillMount () {
    super.componentWillMount();
    comlink.emit('componentWillMount');
  }

  componentWillUnmount () {
    super.componentWillUnmount();
    comlink.emit('componentWillUnmount');
  }

  componentWillUpdate (...args) {
    super.componentWillUpdate(...args);
    comlink.emit('componentWillUpdate', Date.now(), ...args);
  }

  render () {
    if (TESTFLAGS.delayRender) {
      // Simulate a slightly slower rendering process
      for (let i = 0; i < 1000000; i++) {
        // Do nothing
      }
    }
    return 'Hello world';
  }

  renderComponent () {
    /** If we want to capture output separately */
    if (!TESTFLAGS.captureFromRender) {
      return super.renderComponent();
    }

    ceptor.capture();
    super.renderComponent();
    comlink.emit('render');
    return ceptor.release();
  }
}

describe('Component', () => {
  /** After each test remove all listeners on the comlink */
  afterEach(() => {
    comlink.removeAllListeners();
    expect.restoreSpies();
  });

  describe('#constructor', () => {
    it('should create a component instance', () => {
      let component = new TestComponent();

      expect(component).toBeA(Component);
    });

    it('Should throw an error on direct initialization', () => {
      expect(() => {
        return new Component();
      }).toThrow(Error, 'Component must implement a render method.');
    });

    it('should have defined methods', () => {
      var methods = Reflect.ownKeys(Component.prototype);

      expect(methods).toEqual(DEFINED_METHODS);
    });

    it('Should have props defined', () => {
      let component = new TestComponent();

      expect(component.props).toEqual({});
    });

    it('Should have state defined', () => {
      let component = new TestComponent();

      expect(component.props).toEqual({});
    });

    it('Should accept props', () => {
      let component = new TestComponent({ name: 'Jerry' });

      expect(component.props.name).toBe('Jerry');
    });
  });

  describe('#getDefaultProps()', () => {
    it("Should return an object", () => {
      let component = new TestComponent();

      expect(component.getDefaultProps()).toEqual({});
    });
  });

  describe('#getInitialState', () => {
    it('Should return an object', () => {
      let component = new TestComponent();

      expect(component.getInitialState()).toEqual({});
    });
  });

  describe('componentWillMount', () => {
    it('Should fire once from the constructor', (done) => {
      let callCount = 0, component;

      comlink.on('componentWillMount', () => {
        callCount += 1;
        expect(callCount).toBe(1);
      });

      component = new TestComponent();
      component.forceUpdate();

      done();
    });

    it('Should not run on subsequent renders', (done) => {
      let callCount = 0, component;

      comlink.on('componentWillMount', () => {
        callCount += 1;
      });

      component = new TestComponent();

      component.setState({
        name: 'Jerry'
      }, () => {
        expect(callCount).toBe(1);
        done();
      });
    });
  });

  describe('componentDidMount', () => {
    it('Should fire once from the constructor', (done) => {
      let callCount = 0, component;

      comlink.on('componentDidMount', () => {
        callCount += 1;
        expect(callCount).toBe(1);
      });

      component = new TestComponent();
      component.forceUpdate();

      done();
    });

    it('Should not run on subsequent renders', (done) => {
      let callCount = 0, component;

      comlink.on('componentDidMount', () => {
        callCount += 1;
      });

      component = new TestComponent();

      component.setState({
        name: 'Jerry'
      }, () => {
        expect(callCount).toBe(1);
        done();
      });
    });
  });

  describe('componentShouldUpdate', () => {
    it('Should return true by default', () => {
      let component = new TestComponent();

      expect(component.componentShouldUpdate()).toBe(true);
    });

    it('Should return false with current props & state', () => {
      let component = new TestComponent(),
          props = component.props,
          state = component.state;

      expect(component.componentShouldUpdate(props, state)).toBe(false);
    });

    it('Should return true with new props or state', () => {
      let component = new TestComponent(),
          props = component.props;

      expect(component.componentShouldUpdate(props, { name: 'Jerry' })).toBe(true);
    });

    it('Should be triggered from setState', (done) => {
      let component = new TestComponent();

      /** Setup a listener */
      comlink.once('componentShouldUpdate', (shouldUpdate, nextProps, nextState) => {
        expect(shouldUpdate).toBe(true);
        expect(typeof component.state.name).toBe('undefined');
        expect(nextState.name).toBe('Jerry');
        done();
      });

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      });
    });
  });

  describe('componentWillUpdate', () => {
    it('should return undefined', () => {
      let component = new TestComponent();

      expect(typeof component.componentWillUpdate()).toBe('undefined');
    });

    it('should fire from setState', (done) => {
      let component = new TestComponent();

      comlink.once('componentWillUpdate', (time, nextProps, nextState) => {
        expect(nextState.name).toBe('Jerry');
        expect(component.state.name).toNotBe('Jerry');
        done();
      });

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      });
    });

    it('should not fire when setState with same value', (done) => {
      let component = new TestComponent(),
          callCount = 0;

      /** Setup a default */
      component.setState({
        name: 'Jerry'
      });

      comlink.once('componentWillUpdate', (time, nextProps, nextState) => {
        callCount += 1;
        expect(this.state.name).toBe('Jerry');
        expect(nextState.name).toBe('Jerry');
      });

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      }, () => {
        expect(callCount).toBe(0);
        expect(component.state.name).toBe('Jerry');
        done();
      });
    });
  });

  describe('componentDidUpdate', () => {
    after(() => {
      TESTFLAGS.delayRender = false;
    });

    it('should return undefined', () => {
      let component = new TestComponent();

      expect(typeof component.componentDidUpdate()).toBe('undefined');
    });

    it('should fire from setState', (done) => {
      let component = new TestComponent();

      comlink.once('componentDidUpdate', (time, prevProps, prevState) => {
        expect(typeof prevState.name).toBe('undefined');
        expect(component.state.name).toBe('Jerry');
        done();
      });

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      });
    });

    it('should not fire when setState with same value', (done) => {
      let component = new TestComponent(),
          callCount = 0;

      /** Setup a default */
      component.setState({
        name: 'Jerry'
      });

      comlink.once('componentDidUpdate', (time, nextProps, nextState) => {
        callCount += 1;
        expect(this.state.name).toBe('Jerry');
        expect(nextState.name).toBe('Jerry');
      });

      // Finally trigger the function
      component.setState({
        name: 'Jerry'
      }, () => {
        expect(callCount).toBe(0);
        expect(component.state.name).toBe('Jerry');
        done();
      });
    });

    it('should occur after componentWillUpdate', (done) => {
      let component = new TestComponent(),
          componentUpdatedAt;

      comlink.once('componentWillUpdate', (time) => {
        componentUpdatedAt = time;
      });

      comlink.once('componentDidUpdate', (time) => {
        expect(componentUpdatedAt).toNotBe(Date.now());
        expect(componentUpdatedAt).toNotBe(time);
        expect(time > componentUpdatedAt).toBe(true);
        done();
      });

      /** Make rendering take a little longer */
      TESTFLAGS.delayRender = true;

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      }, () => {
        TESTFLAGS.delayRender = false;
      });
    });
  });

  describe('#componentWillUnmount', () => {
    it('Should fire when component is removed', (done) => {
      let component = new TestComponent(),
          callCount = 0;

      comlink.on('componentWillUnmount', () => {
        callCount += 1;
        expect(callCount).toBe(1);
        done();
      });

      /** Finally remove the component */
      component.remove();
    });
  });

  describe('#forceUpdate()', () => {
    it('Trigger a render', () => {
      let component = new TestComponent(),
          callCount = 0;

      comlink.on('render', () => {
        callCount += 1;
      });

      component.forceUpdate();

      expect(callCount).toBe(1);
    });

    it('Should case both componentWillUpdate and componentDidUpdate to fire', () => {
      let component = new TestComponent(),
          wasWillUpdateCalled = false,
          wasDidUpdateCalled = false;

      comlink.on('componentWillUpdate', () => {
        wasWillUpdateCalled = true;
      });

      comlink.on('componentDidUpdate', () => {
        wasDidUpdateCalled = true;
      });

      component.forceUpdate();

      expect(wasWillUpdateCalled).toBe(true);
      expect(wasDidUpdateCalled).toBe(true);
    });

    it('Should accept a callback', (done) => {
      let component = new TestComponent(),
          callCount = 0;

      comlink.on('render', () => {
        callCount += 1;
      });

      component.forceUpdate(() => {
        expect(callCount).toBe(1);
        done();
      });
    });
  });

  describe('#listenTo()', () => {
    it('Should create a listener on comlink', (done) => {
      let component = new TestComponent();

      component.listenTo(comlink, 'listen_to_test', () => {
        done();
      });

      comlink.emit('listen_to_test');
    });

    it('should set the context to the component', (done) => {
      let component = new TestComponent();

      component.listenTo(comlink, 'listen_to_test', function () {
        expect(component).toBe(this);
        done();
      });

      comlink.emit('listen_to_test');
    });

    it('Should fire as many times as it is called', (done) => {
      let component = new TestComponent(),
          callCount = 0;

      component.listenTo(comlink, 'listen_to_test', () => {
        callCount += 1;
      });

      comlink.emit('listen_to_test');
      comlink.emit('listen_to_test');

      expect(callCount).toBe(2);
      done();
    });
  });

  describe('#listenToOnce()', () => {
    it('Should create a listener on the comlink', (done) => {
      let component = new TestComponent();

      component.listenToOnce(comlink, 'listen_to_test', () => {
        done();
      });

      comlink.emit('listen_to_test');
    });

    it('Should only fire once', () => {
      let component = new TestComponent(),
          callCount = 0;

      component.listenToOnce(comlink, 'listen_to_test', () => {
        callCount += 1;
      });

      comlink.emit('listen_to_test');
      comlink.emit('listen_to_test');

      expect(callCount).toBe(1);
    });

    it('Should remove itself from component listeners', () => {
      let component = new TestComponent(),
          callCount = 0;

      component.listenToOnce(comlink, 'listen_to_test', () => {
        callCount += 1;
      });

      expect(component._listeners.length).toBe(1, 'Component should have 1 listener');

      comlink.emit('listen_to_test');

      expect(callCount).toBe(1);
      expect(component._listeners.length).toBe(0, `Component should have no listeners. Found ${component._listeners.length}`);
    });
  });

  describe('#off()', () => {
    it('Should remove an event listener', () => {
      let component = new TestComponent(),
          callCount = 0;

      expect(callCount).toBe(0);

      component.on('off_test', () => {
        callCount += 1;
      });

      expect(component._listeners.length).toBe(1);

      component.emit('off_test');
      component.off('off_test');
      component.emit('off_test');

      expect(callCount).toBe(1);
      expect(component._listeners.length).toBe(0);
    });
  });

  describe('#on()', () => {
    it('Should add an event listener', () => {
      let component = new TestComponent(),
          callCount = 0;

      component.on('on_test', () => {
        callCount += 1;
      });

      component.emit('on_test');
      component.emit('on_test');

      expect(callCount).toBe(2);
      expect(component._listeners.length).toBe(1);

      component.off('on_test');

      component.emit('on_test');

      expect(callCount).toBe(2);
      expect(component._listeners.length).toBe(0);
    });
  });

  describe('#remove()', () => {
    it('Should call componentWillUnmount and remove listeners', () => {
      let component = new TestComponent(),
          callCount = 0,
          spy = expect.spyOn(component, 'componentWillUnmount');

      component.on('remove_test', () => {
        callCount += 1;
      });

      component.emit('remove_test');

      expect(callCount).toBe(1);

      component.remove();
      component.emit('remove_test');

      expect(spy.calls.length).toEqual(1);
      expect(callCount).toBe(1);
    });
  });

  describe('#render()', () => {
    it('Should return a string', () => {
      let component = new TestComponent();

      expect(component.render()).toBe('Hello world');
    });
  });

  describe('#renderComponent()', () => {
    it('Should write to console', () => {
      let component = new TestComponent(),
          output;

      ceptor.capture();
      component.renderComponent();
      output = ceptor.release();

      expect(output).toBe('Hello world');
    });
  });

  describe('#set()', () => {
    it('Should update state', () => {
      let component = new TestComponent(),
          willUpdateSpy = expect.spyOn(component, 'componentWillUpdate'),
          didUpdateSpy = expect.spyOn(component, 'componentDidUpdate'),
          callCount = 0;

      component.set('state', {
        name: 'Jerry'
      }, () => {
        callCount += 1;
      });

      expect(willUpdateSpy.calls.length).toBe(1);
      expect(willUpdateSpy.calls[0].arguments).toEqual([{}, { name: 'Jerry' }]);
      expect(didUpdateSpy.calls.length).toBe(1);
      expect(didUpdateSpy.calls[0].arguments).toEqual([{}, { }]);
      expect(callCount).toBe(1);
    });

    it('Should not update props', () => {
      let component = new TestComponent(),
          willUpdateSpy = expect.spyOn(component, 'componentWillUpdate'),
          didUpdateSpy = expect.spyOn(component, 'componentDidUpdate'),
          callCount = 0;

      component.set('props', {
        name: 'Jerry'
      }, () => {
        callCount += 1;
      });

      expect(willUpdateSpy.calls.length).toBe(0);
      expect(didUpdateSpy.calls.length).toBe(0);
      expect(callCount).toBe(1);
    });
  });

  describe('#setState()', () => {
    it('Should update state data', () => {
      let component = new TestComponent(),
          willUpdateSpy = expect.spyOn(component, 'componentWillUpdate'),
          didUpdateSpy = expect.spyOn(component, 'componentDidUpdate');

      component.setState({
        name: 'Jerry'
      });

      expect(component.state.name).toBe('Jerry');
      expect(willUpdateSpy.calls.length).toBe(1);
      expect(willUpdateSpy.calls[0].arguments).toEqual([{}, { name: 'Jerry' }]);
      expect(didUpdateSpy.calls.length).toBe(1);
      expect(didUpdateSpy.calls[0].arguments).toEqual([{}, {}]);

      component.setState({
        name: 'Gary'
      });

      expect(component.state.name).toBe('Gary');
      expect(willUpdateSpy.calls.length).toBe(2);
      expect(willUpdateSpy.calls[1].arguments).toEqual([{}, { name: 'Gary' }]);
      expect(didUpdateSpy.calls.length).toBe(2);
      expect(didUpdateSpy.calls[1].arguments).toEqual([{}, { name: 'Jerry' }]);
    });
  });

  describe('#stopListening()', () => {
    it('Should remove listeners', () => {
      let component = new TestComponent(),
          callCount = 0,
          listener = () => {
            callCount += 1;
          },
          vent = new EventEmitter();

      expect(component._listeners.length).toBe(0, 'Listeners length should be 0');

      component.listenTo(vent, 'listen_to_test', listener);

      expect(component._listeners.length).toBe(1, 'Listeners length should be 1');

      vent.emit('listen_to_test');

      expect(component._listeners.length).toBe(1, 'Listeners length is not 1');
      expect(callCount).toBe(1, 'Call count should be 1.');

      component.stopListening(vent);

      expect(vent.listeners('listen_to_test').length).toBe(0);
      expect(component._listeners.length).toBe(0, `Listeners length is not 0. Found ${component._listeners.length}`);

      vent.emit('listen_to_test');
      expect(callCount).toBe(1, `Call count should still be 1. Found ${callCount}.`);
    });

    it('Should remove all listeners', (done) => {
      let component = new TestComponent(),
          vent = new EventEmitter(),
          callCount = 0,
          events = [],
          listener = (name) => {
            callCount += 1;
            events.push(name);
          };

      component.on('remove_test', listener);
      component.listenTo(vent, 'remove_test', listener);

      component.emit('remove_test', 'component');
      vent.emit('remove_test', 'vent');

      expect(callCount).toBe(2);

      expect(component._listeners[1].handler).toBe(vent._events.remove_test);

      component.stopListening();

      component.emit('remove_test', 'component');
      vent.emit('remove_test', 'vent');

      expect(component.listenerCount('remove_test')).toBe(0);
      expect(vent.listenerCount('remove_test')).toBe(0);
      expect(events).toEqual(['component', 'vent']);
      expect(callCount).toBe(2);
      done();
    });
  });
});
