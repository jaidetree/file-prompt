/**
 * Component Class Unit Test
 */
import jest from 'jest-cli';
import EventEmitter from 'events';
import assert from 'assert';
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
        'remove',
        'render',
        'renderComponent',
        'set',
        'setProps',
        'setState',
        'stopListening',
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
  render () {
    if (TESTFLAGS.delayRender) {
      // Simulate a slightly slower rendering process
      for(let i = 0; i < 1000000; i++) {
        // Do nothing 
      }
    }
    return 'Hello world';
  }

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
  });

  describe('#constructor', () => {
    it('should create a component instance', () => {
      let component = new TestComponent(); 
      assert.ok(component instanceof Component);
    });

    it('Should throw an error on direct initialization', () => {
      assert.throws(() => {
        new Component();
      }, Error, 'Component must implement a render method.');
    });

    it('should have defined methods', () => {
      var methods = Object.getOwnPropertyNames(Component.prototype);
      assert.deepEqual(methods, DEFINED_METHODS);
    });

    it('Should have props defined', () => {
      let component = new TestComponent();
      assert.deepEqual(component.props, {});
    });

    it('Should have state defined', () => {
      let component = new TestComponent();
      assert.deepEqual(component.props, {});
    });

    it('Should accept props', () => {
      let component = new TestComponent({ name: 'Jerry' });
      assert.equal(component.props.name, 'Jerry');
    });
  });

  describe('#getDefaultProps()', () => {
    it("Should return an object", () => {
      let component = new TestComponent();
      assert.deepEqual(component.getDefaultProps(), {});
    });
  });

  describe('#getInitialState', () => {
    it('Should return an object', () => {
      let component = new TestComponent();
      assert.deepEqual(component.getInitialState(), {});
    });
  });

  describe('componentWillMount', () => {
    it('Should fire once from the constructor', (done) => {
        let callCount = 0, component;

        comlink.on('componentWillMount', () => {
          callCount += 1;
          assert.equal(callCount, 1);
        });

        component = new TestComponent();

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
        }, function () {
          assert.equal(callCount, 1);
          done();
        });
    });
  });

  describe('componentDidMount', () => {
    it('Should fire once from the constructor', (done) => {
        let callCount = 0, component;

        comlink.on('componentDidMount', () => {
          callCount += 1;
          assert.equal(callCount, 1);
        });

        component = new TestComponent();

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
        }, function () {
          assert.equal(callCount, 1);
          done();
        });
    });
  });

  describe('componentShouldUpdate', () => {
    it('Should return true by default', () => {
      let component = new TestComponent();
      assert.equal(component.componentShouldUpdate(), true);
    });
    
    it('Should return false with current props & state', () => {
      let component = new TestComponent(),
          props = component.props,
          state = component.state;
      assert.equal(component.componentShouldUpdate(props, state), false);
    });
    
    it('Should return true with new props or state', () => {
      let component = new TestComponent(),
          props = component.props,
          state = component.state;
      assert.equal(component.componentShouldUpdate(props, { name: 'Jerry' }), true);
    });

    it('Should be triggered from setState', (done) => {
      let component = new TestComponent();

      /** Setup a listener */
      comlink.once('componentShouldUpdate', (shouldUpdate, nextProps, nextState) => {
        assert.equal(shouldUpdate, true);
        assert.equal(typeof component.state.name, 'undefined');
        assert.equal(nextState.name, 'Jerry');
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

      assert.equal(typeof component.componentWillUpdate(), 'undefined');
    });

    it('should fire from setState', (done) => {
      let component = new TestComponent();

      comlink.once('componentWillUpdate', (time, nextProps, nextState) => {
        assert.equal(nextState.name, 'Jerry');
        assert.notEqual(component.state.name, 'Jerry');
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
        assert.equal(this.state.name, 'Jerry');
        assert.equal(nextState.name, 'Jerry');
      });

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      }, function () {
        assert.equal(callCount, 0);
        assert.equal(component.state.name, 'Jerry');
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

      assert.equal(typeof component.componentDidUpdate(), 'undefined');
    });

    it('should fire from setState', (done) => {
      let component = new TestComponent();

      comlink.once('componentDidUpdate', (time, prevProps, prevState) => {
        assert.equal(typeof prevState.name, 'undefined');
        assert.equal(component.state.name, 'Jerry');
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
        assert.equal(this.state.name, 'Jerry');
        assert.equal(nextState.name, 'Jerry');
      });

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      }, function () {
        assert.equal(callCount, 0);
        assert.equal(component.state.name, 'Jerry');
        done();
      });
    });

    it('should occur after componentWillUpdate', (done) => {
      let component = new TestComponent(),
          componentUpdatedAt;

      comlink.once('componentWillUpdate', (time, nextProps, nextState) => {
        componentUpdatedAt = time;
      });

      comlink.once('componentDidUpdate', (time, nextProps, nextState) => {
        assert.notEqual(componentUpdatedAt, Date.now());
        assert.notEqual(time, componentUpdatedAt);
        assert.ok(time > componentUpdatedAt);
        done();
      });

      /** Make rendering take a little longer */
      TESTFLAGS.delayRender = true;

      /** Finally trigger the function */
      component.setState({
        name: 'Jerry'
      }, function () {
          TESTFLAGS.delayRender = false; 
      });
    });
  });

  describe('#componentWillUnmount', () => {
    it('Should fire when component is removed', (done) => {
      let component = new TestComponent(),
          callCount = 0;

      comlink.on('componentWillUnmount', () => {
        callCount +=  1;
        assert.equal(callCount, 1);
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

      comlink.on('render', function () {
        callCount += 1;
      });

      component.forceUpdate();

      assert.equal(callCount, 1);
    });

    it('Should case both componentWillUpdate and componentDidUpdate to fire', () => {
      let component = new TestComponent(),
          wasWillUpdateCalled = false,
          wasDidUpdateCalled = false;

      comlink.on('componentWillUpdate', function () {
        wasWillUpdateCalled = true;
      });

      comlink.on('componentDidUpdate', function () {
        wasDidUpdateCalled = true;
      });

      component.forceUpdate();

      assert.equal(wasWillUpdateCalled, true);
      assert.equal(wasDidUpdateCalled, true);
    });

    it('Should accept a callback', (done) => {
      let component = new TestComponent(),
          callCount = 0;

      comlink.on('render', function () {
        callCount += 1;
      });

      component.forceUpdate(() => {
        assert.equal(callCount, 1);
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
        assert.equal(component, this);
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

      assert.equal(callCount, 2);
      done();
    });

    it('Should remove the listener when removed from target', () => {
      let component = new TestComponent(),
          callCount = 0,
          listener = () => {
            callCount += 1;
          };

      component.on('on_test', listener);
      component.on('on_test_2', listener);

      console.log(component._events);

      assert.equal(component.listeners.length, 1, 'Listeners length should be 1');

      component.emit('on_test');

      assert.equal(component.listeners.length, 1, 'Listeners length is not 1');
      assert.equal(callCount, 1, 'Call count should be 1.');

      comlink.removeListener('on_test', listener);
      component.emit('on_test');
      assert.equal(callCount, 1, 'Call count should still be 1.');
      assert.equal(component.listeners.length, 0, 'Listeners length is not 0');
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
        callCount += 1
      });

      comlink.emit('listen_to_test');
      comlink.emit('listen_to_test');

      assert.equal(callCount, 1);
    });
    

    it('Should remove itself from component listeners', () => {
      let component = new TestComponent(),
          callCount = 0;

      component.listenToOnce(comlink, 'listen_to_test', () => {
        callCount += 1
      });

      assert.equal(component.listeners.length, 1);

      comlink.emit('listen_to_test');

      assert.equal(callCount, 1);
      assert.equal(component.listeners.length, 0);
    });
  });

  describe('#off()', () => {
    it('Should remove an event listener', () => {
      let component = new TestComponent(),
          callCount = 0;

      component.on('off_test');
    });
    
  });
  
  

});
