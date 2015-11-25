import expect from 'expect';
import EventEmitter from 'events';
import Component from '../src/component';
import StdoutInterceptor from './lib/stdout_interceptor';

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
  'once',
  'remove',
  'render',
  'renderComponent',
  'set',
  'setProps',
  'setState',
  'stopListening'
];

let comlink = new EventEmitter();

/**
 * We are creating a test component because the component class is not intended
 * to be instantiated directly
 */
class TestComponent extends Component {
  render () {
    return 'Hello world';
  }
}

describe('Component', () => {
  /** After each test remove all listeners on the comlink */
  afterEach(() => {
    expect.restoreSpies();
    comlink.removeAllListeners();
  });

  describe('#constructor', () => {
    it('should create a component instance', () => {
      let component = new TestComponent();

      expect(component).toBeA(Component);
    });

    it('Should throw an error on direct initialization', () => {
      expect(() => {
        return new Component().render();
      }).toThrow(Error, 'Component must implement a render method.');
    });

    it('should have defined methods', () => {
      var methods = Object.getOwnPropertyNames(Component.prototype);

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

  describe('#getInitialState()', () => {
    it('Should return an object', () => {
      let component = new TestComponent();

      expect(component.getInitialState()).toEqual({});
    });
  });

  describe('#componentWillMount()', () => {
    it('Should fire once after being mounted', () => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentWillMount'),
          ceptor = new StdoutInterceptor();

      ceptor.capture();
      Component.mount(component);
      ceptor.release();


      component.forceUpdate();
      expect(spy).toHaveBeenCalled('Spy was not called');
      expect(spy.calls.length).toBe(1);
    });

    it('Should not run on subsequent renders', (done) => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentWillMount'),
          ceptor = new StdoutInterceptor();

      ceptor.capture();
      Component.mount(component);
      ceptor.release();

      ceptor.capture();
      component.setState({
        name: 'Jerry'
      }, () => {
        expect(spy.calls.length).toBe(1);
        done();
      });
      ceptor.release();
    });
  });

  describe('componentDidMount()', () => {
    it('Should fire once from the constructor', () => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentDidMount'),
          ceptor = new StdoutInterceptor();

      ceptor.capture();
      Component.mount(component);
      ceptor.release();

      expect(spy).toHaveBeenCalled();
      component.forceUpdate();
      expect(spy.calls.length).toBe(1);
    });

    it('Should not run on subsequent renders', () => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentDidMount'),
          ceptor = new StdoutInterceptor();

      ceptor.capture();
      Component.mount(component);
      ceptor.release();

      component.setState({
        name: 'Jerry'
      }, () => {
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.length).toBe(1);
      });
    });
  });

  describe('componentShouldUpdate', () => {
    it('Should return true by default', () => {
      let component = new TestComponent();

      expect(component.componentShouldUpdate()).toBe(true);
    });

    it('Should return true if given new state data', () => {
      let component = new TestComponent();

      expect(component.componentShouldUpdate({}, { name: 'Jerry' })).toBe(true);
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

    it('Should be triggered from setState', () => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentShouldUpdate')
                .andCallThrough();

      component.setState({
        name: 'Jerry'
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({}, { name: 'Jerry' });
      expect(component.state.name).toBe('Jerry');
    });
  });

  describe('componentWillUpdate', () => {
    it('Should return undefined', () => {
      let component = new TestComponent();

      expect(typeof component.componentWillUpdate()).toBe('undefined');
    });

    it('Should fire from setState', () => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentWillUpdate')
                .andCallThrough();

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({}, { name: 'Jerry' });
      expect(component.state.name).toBe('Jerry');
    });

    it('Should not fire when setState with same value', (done) => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentWillUpdate')
                .andCallThrough();

      /** Setup a default */
      component.setState({
        name: 'Jerry'
      });

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      }, () => {
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.length).toBe(1);
        expect(component.state.name).toBe('Jerry');
        expect(spy).toHaveBeenCalledWith({}, { name: 'Jerry' });
        done();
      });
    });
  });

  describe('componentDidUpdate', () => {
    it('Should return undefined', () => {
      let component = new TestComponent();

      expect(typeof component.componentDidUpdate()).toBe('undefined');
    });

    it('Should fire from setState', () => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentDidUpdate');

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      });

      expect(component.state.name).toBe('Jerry');
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith({}, {});
    });

    it('Should not fire when setState with same value', (done) => {
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

    it('Should occur after componentWillUpdate', (done) => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentDidUpdate'),
          componentUpdatedAt;

      expect.spyOn(component, 'componentWillUpdate')
        .andCall(() => {
          let count = 0;
          componentUpdatedAt = Date.now();
          for (let i = 0; i < 1000000; i++) {
            // Delay the distance between methods
            count = i;
          }
        });

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      }, () => {
        let time = Date.now();

        expect(spy).toHaveBeenCalled();
        expect(componentUpdatedAt).toNotBe(time);
        expect(time > componentUpdatedAt).toBe(true);

        done();
      });
    });
  });

  describe('#componentWillUnmount', () => {
    it('Should fire when component is removed', () => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'componentWillUnmount');

      component.remove();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#forceUpdate()', () => {
    it('Should trigger a render', () => {
      let component = new TestComponent(),
          spy = expect.spyOn(component, 'render');

      component.forceUpdate();

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(1);
    });

    it('Should cause both componentWillUpdate and componentDidUpdate to fire', () => {
      let component = new TestComponent(),
          willSpy = expect.spyOn(component, 'componentWillUpdate'),
          didSpy = expect.spyOn(component, 'componentDidUpdate');

      component.forceUpdate();

      expect(willSpy).toHaveBeenCalled();
      expect(didSpy).toHaveBeenCalled();
    });

    it('Should accept a callback', () => {
      let component = new TestComponent(),
          spy = expect.createSpy();

      component.forceUpdate(spy);

      expect(spy).toHaveBeenCalled();
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

    it('Should set the context to the component', (done) => {
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
          spy = expect.createSpy();

      component.listenToOnce(comlink, 'listen_to_test', spy);

      comlink.emit('listen_to_test');
      comlink.emit('listen_to_test');

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(1);
    });

    it('Should remove itself from component listeners', () => {
      let component = new TestComponent(),
          spy = expect.createSpy();

      component.listenToOnce(comlink, 'listen_to_test', spy);

      expect(component._listeners.length).toBe(1, 'Component should have 1 listener');

      comlink.emit('listen_to_test');

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(1);
      expect(component._listeners.length).toBe(0, `Component should have no listeners. Found ${component._listeners.length}`);
    });
  });

  describe('#off()', () => {
    it('Should remove an event listener', () => {
      let component = new TestComponent(),
          spy = expect.createSpy();

      component.on('off_test', spy);

      expect(component._listeners.length).toBe(1);

      component.emit('off_test');
      component.off('off_test');
      component.emit('off_test');

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(1);
      expect(component._listeners.length).toBe(0);
    });
  });

  describe('#on()', () => {
    it('Should add an event listener', () => {
      let component = new TestComponent(),
          spy = expect.createSpy();

      component.on('on_test', spy);

      component.emit('on_test');
      component.emit('on_test');

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(2);
      expect(component._listeners.length).toBe(1);

      component.off('on_test');

      component.emit('on_test');

      expect(spy.calls.length).toBe(2);
      expect(component._listeners.length).toBe(0);
    });
  });

  describe('#remove()', () => {
    it('Should call componentWillUnmount and remove listeners', () => {
      let component = new TestComponent(),
          spy = expect.createSpy(),
          willSpy = expect.spyOn(component, 'componentWillUnmount');

      component.on('remove_test', spy);

      component.emit('remove_test');

      expect(spy.calls.length).toBe(1);

      component.remove();
      component.emit('remove_test');

      expect(willSpy).toHaveBeenCalled();
      expect(willSpy.calls.length).toBe(1);
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(1);
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
          ceptor = new StdoutInterceptor(),
          output = "";

      ceptor.capture();
      Component.mount(component);
      output = ceptor.release();

      expect(output).toBe('Hello world');
    });

    it('Should write new content after state update', () => {
      let component = new TestComponent();

      component.setState({
        name: 'Jerry'
      });

      expect(component._content).toBe('Hello world\n');
    });
  });

  describe('#set()', () => {
    it('Should update state', () => {
      let component = new TestComponent(),
          willUpdateSpy = expect.spyOn(component, 'componentWillUpdate'),
          didUpdateSpy = expect.spyOn(component, 'componentDidUpdate'),
          spy = expect.createSpy();

      component.set('state', {
        name: 'Jerry'
      }, spy);

      expect(willUpdateSpy).toHaveBeenCalled();
      expect(willUpdateSpy).toHaveBeenCalledWith({}, { name: 'Jerry' });
      expect(didUpdateSpy).toHaveBeenCalled();
      expect(didUpdateSpy).toHaveBeenCalledWith({}, { });
      expect(spy).toHaveBeenCalled();
    });

    it('Should not update props', () => {
      let component = new TestComponent(),
          willUpdateSpy = expect.spyOn(component, 'componentWillUpdate'),
          didUpdateSpy = expect.spyOn(component, 'componentDidUpdate'),
          spy = expect.createSpy();

      component.set('props', {
        name: 'Jerry'
      }, spy);

      expect(willUpdateSpy).toNotHaveBeenCalled();
      expect(didUpdateSpy).toNotHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
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
      expect(willUpdateSpy).toHaveBeenCalled();
      expect(willUpdateSpy).toHaveBeenCalledWith({}, { name: 'Jerry' });
      expect(didUpdateSpy).toHaveBeenCalled();
      expect(didUpdateSpy).toHaveBeenCalledWith({}, {});

      component.setState({
        name: 'Gary'
      });

      expect(component.state.name).toBe('Gary');
      expect(willUpdateSpy.calls.length).toBe(2);
      expect(willUpdateSpy).toHaveBeenCalledWith({}, { name: 'Gary' });
      expect(didUpdateSpy.calls.length).toBe(2);
      expect(didUpdateSpy).toHaveBeenCalledWith({}, { name: 'Jerry' });
    });
  });

  describe('#stopListening()', () => {
    it('Should remove listeners', () => {
      let component = new TestComponent(),
          spy = expect.createSpy(),
          vent = new EventEmitter();

      expect(component._listeners.length).toBe(0, 'Listeners length should be 0');

      component.listenTo(vent, 'listen_to_test', spy);

      expect(component._listeners.length).toBe(1, 'Listeners length should be 1');

      vent.emit('listen_to_test');

      expect(component._listeners.length).toBe(1, 'Listeners length is not 1');
      expect(spy).toHaveBeenCalled('"listen_to_test" should have been called.');

      component.stopListening(vent);

      expect(vent.listeners('listen_to_test').length).toBe(0);
      expect(component._listeners.length).toBe(0, `Listeners length is not 0. Found ${component._listeners.length}`);

      vent.emit('listen_to_test');
      expect(spy.calls.length).toBe(1, `Call count should still be 1. Found ${spy.calls.length}.`);
    });

    it('Should remove all listeners', () => {
      let component = new TestComponent(),
          vent = new EventEmitter(),
          events = [],
          spy = expect.createSpy()
                  .andCall((name) => {
                    events.push(name);
                  });

      component.on('remove_test', spy);
      component.listenTo(vent, 'remove_test', spy);

      component.emit('remove_test', 'component');
      vent.emit('remove_test', 'vent');

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(2);

      component.stopListening();

      component.emit('remove_test', 'component');
      vent.emit('remove_test', 'vent');

      expect(component.listenerCount('remove_test')).toBe(0);
      expect(vent.listenerCount('remove_test')).toBe(0);
      expect(events).toEqual(['component', 'vent']);
      expect(spy.calls.length).toBe(2);
    });
  });
});
