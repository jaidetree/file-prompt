'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint no-unused-vars: 0 */

/**
 * Create Listener
 * Private method to add listener
 * Decided to use a simple object literal to allow use of underscore collection
 * methods to traverse the array.
 *
 * @param {object} obj - Object to create the listener for
 * @param {string} event - Event name to listen for
 * @param {function} callback - Event handler
 * @param {object} context - Context to call the callback with
 * @returns {object} A listener object
 */
function createListener(obj, event, callback, context) {
  var listener = {
    id: _underscore2.default.uniqueId('l'),
    obj: obj,
    event: event,
    callback: callback,
    context: context
  },
      test = undefined;

  return listener;
}

/**
 * Component
 * Base component class has react like functionality to make building
 * the CLI ui more quickly.
 *
 * @class
 * @property {object} state - State of the component instance
 * @property {object} properties - Initial properties of the component
 * @property {array} listeners - Collection of current listeners
 */
var Component = class Component extends _events2.default {

  /**
   * Constructor
   * Initializes the component instance
   *
   * @constructor
   * @param {object} props - Initial component properties
   */
  constructor(props) {
    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Component).call(this));

    _this.state = {};
    _this.props = {};
    _this.listeners = [];

    _this.props = _this.getDefaultProps();

    // If we have props extend our default props with it
    if (props) {
      Object.assign(_this.props, props);
    }

    _this.state = _this.getInitialState();

    _this.componentWillMount();
    _this.renderComponent();
    _this.componentDidMount();
    return _this;
  }

  /**
   * Component Did Mount
   * Component was just rendered to the screen
   *
   * @method
   * @private
   * @returns {void}
   */
  componentDidMount() {
    return;
  }

  /**
   * Component Did Update
   * Component has rerendered in the console
   *
   * @method
   * @private
   * @param {object} prevProps - Previous set of rendered props
   * @param {object} prevState - Previous component state
   * @returns {void}
   */
  componentDidUpdate(prevProps, prevState) {
    return;
  }

  /**
   * Component Should Update
   * Determines if the component should even update
   *
   * @method
   * @private
   * @param {object} nextProps - Next set of properties
   * @param {object} nextState - Next component state object
   * @returns {boolean} Returns true if component should re-render
   */
  componentShouldUpdate(nextProps, nextState) {
    return !_underscore2.default.isEqual(nextState, this.state);
  }

  /**
   * Component Will Mount
   * Component is about to be rendered
   *
   * @method
   * @private
   * @returns {void}
   */
  componentWillMount() {
    return;
  }

  /**
   * Component Will Unmount
   * Component is about to be removed from display
   *
   * @method
   * @private
   * @returns {void}
   */
  componentWillUnmount() {
    return;
  }

  /**
   * Component Will Update
   * Component is about to update
   *
   * @method
   * @private
   * @param {object} nextProps - Next set of properties
   * @param {object} nextState - Next component state object
   * @returns {void}
   */
  componentWillUpdate(nextProps, nextState) {
    return;
  }

  /**
   * Get Default Props
   * Returns the default properties object for component
   *
   * @method
   * @private
   * @returns {object} Default component properties
   */
  getDefaultProps() {
    return {};
  }

  /**
   * Get Initial State
   * Returns the initial state data
   *
   * @method
   * @private
   * @returns {object} Initial component state
   */
  getInitialState() {
    return {};
  }

  /**
   * Force Update
   * A method to immediately re-render the component if outside data
   * has changed.
   *
   * @method
   * @param {function} [callback] - Optional callback to call after render
   */
  forceUpdate(callback) {
    this.componentWillUpdate(this.props, this.state);
    this.renderComponent();
    this.componentDidUpdate(this.props, this.state);

    /** Call the callback supplying this context */
    if (typeof callback === 'function') {
      Reflect.apply(callback, this);
    }
  }

  /**
   * Listen To
   * Adds a listener to an observable object
   *
   * @method
   * @public
   * @param {object} obj - Observable object
   * @param {string} event - Name of the event to listen to
   * @param {function} callback - Callback to trigger from event
   * @param {object} [context] - Optional context to call the trigger with
   */
  listenTo(obj, event, callback, _x) {
    var _this2 = this;

    var context = arguments.length <= 3 || arguments[3] === undefined ? this : arguments[3];

    /** Keep track of what we're listening to */
    this.listeners.push(createListener(obj, event, callback, context));
    obj.on(event, callback.bind(context));
    obj.on('removeListener', function (eventName, handler) {
      _this2.stopListening(obj, eventName, handler);
    });
  }

  /**
   * Listen To Once
   * Adds a listener to an observable object that executes only once
   *
   * @method
   * @public
   * @param {object} obj - Observable object
   * @param {string} event - Name of the event to listen to
   * @param {function} callback - Callback to trigger from event
   * @param {object} [context] - Optional context to call the trigger with
   */
  listenToOnce(obj, event, callback, _x2) {
    var _this3 = this;

    var context = arguments.length <= 3 || arguments[3] === undefined ? this : arguments[3];

    var listener = createListener(obj, event, callback, context);

    obj.once(event, function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      /** Remove this from our list of listeners */
      _this3.listeners = _underscore2.default.without(_this3.listeners, listener);
      Reflect.apply(context, args);
    });
    obj.on('removeListener', function (eventName, handler) {
      _this3.stopListening(obj, eventName, handler);
    });
  }

  /**
   * Off
   * Removes an event listener. Calling this method with no params
   * removes all listeners tied to this component's context.
   *
   * @method
   * @public
   * @param {string} [event] - Event name to stop listening for
   * @param {function} [callback] - Event handler to remove
   * @param {object} [context] - Context of handlers to stop listening to
   */
  off(event, callback, _x3) {
    var context = arguments.length <= 2 || arguments[2] === undefined ? this : arguments[2];

    this.stopListening(this, event, callback, context);
  }

  /**
   * On
   * Small ovveride to track the listeners this component has going on
   *
   * @method
   * @public
   * @param {string} event - Name of the event to listen to
   * @param {function} callback - Event handler
   * @param {context} [context] - Optional context to call handler with
   * @returns {*} Result of listener being added
   */
  on(event, callback, _x4) {
    var context = arguments.length <= 2 || arguments[2] === undefined ? this : arguments[2];

    this.listeners.push(createListener(this, event, callback, context));
    return _get(Object.getPrototypeOf(Component.prototype), 'on', this).call(this, event, callback);
  }

  /**
   * Remove
   * Removes the component from the UI
   *
   * @method
   * @public
   */
  remove() {
    this.stopListening();
    this.componentWillUnmount();
  }

  /**
   * Render
   * Returns the string to write to the console
   *
   * @method
   * @private
   */
  render() {
    throw new Error('Component must implement a render method.');
  }

  /**
   * Render Component
   * Renders the output of the render method to console
   *
   * @method
   * @private
   */
  renderComponent() {
    process.stdout.write(this.render().toString() + ' \n');
  }

  /**
   * Set
   * Update either state or props and rerender
   *
   * @method
   * @private
   * @param {string} key - Either 'state' or 'props'
   * @param {object} data - Data to set on component
   * @param {function} [callback] - Callback to fire after re-rendering
   */
  set(key, data, callback) {
    var prev = {
      props: _underscore2.default.clone(this.props),
      state: _underscore2.default.clone(this.state)
    },
        next = {
      props: _underscore2.default.clone(this.props),
      state: _underscore2.default.clone(this.state)
    };

    /** Get what the next set of data would be */
    next[key] = Object.assign(next[key], data);

    /** See if the component should re-render or not */
    if (this.componentShouldUpdate(next.props, next.state)) {
      this.componentWillUpdate(next.props, next.state);

      /** Update a */
      this[key] = next[key];
      this.renderComponent();
      this.componentDidUpdate(prev.props, prev.state);
    } else {
      this[key] = next[key];
    }

    /** Call the callback supplying this context */
    if (typeof callback === 'function') {
      Reflect.apply(callback, this);
    }
  }

  /**
   * Set Props
   * A method to update the component's props and re-render
   *
   * @method
   * @public
   * @param {object} data - New data
   * @param {function} [callback] - Callback to fire after re-rendering
   */
  setProps(data, callback) {
    this.set('props', data, callback);
  }

  /**
   * Set State
   * A method to update the component's state and re-render
   *
   * @method
   * @public
   * @param {object} data - New data
   * @param {function} [callback] - Callback to fire after re-rendering
   */
  setState(data, callback) {
    this.set('state', data, callback);
  }

  /**
   * Stop Listening
   * Query the event listeners by the given criteria and remove them
   *
   * @method
   * @public
   * @param {[type]} [varname] [description]
   */
  stopListening() {
    var _this4 = this;

    var criteria = {},
        listeners = this.listeners,
        names = ['obj', 'event', 'callback', 'context'];

    /** For truthy values attach them to the criteria object */

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (args.length > 0) {
      args.forEach(function (arg, i) {
        if (arg) {
          criteria[names[i]] = arg;
        }
      });
    }

    /** Filter the listeners to what matches the criteria */
    if (Object.keys(criteria).length > 0) {
      listeners = _underscore2.default.where(listeners, criteria);
    }

    /** Tell the obj to stop listening for events */
    listeners.forEach(function (listener) {
      listener.obj.removeListener(listener.event, listener.callback);
      _this4.listeners = _this4.listeners.splice(_this4.listeners.indexOf(listener), 1);
    });
  }

};
exports.default = Component;