'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; } /* eslint no-unused-vars: 0 */

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
  var handler = callback.bind(context);

  return {
    id: _underscore2.default.uniqueId('l'),
    obj: obj,
    event: event,
    handler: handler,
    callback: callback,
    context: context
  };
}

/**
 * Write
 * A single function responsible for outputting to the screen. Just in case
 * I end up switching between console.log or some other means there is
 * only one place that needs to be changed.
 *
 * @param {string} content - Content to display
 * @param {Component} component - The component to read the stdout props from
 */
function write(content, component) {
  var writer = component.props.stdout || process.stdout;

  writer.write(content);
}

/**
 * Write Array
 * Iterates through the array to figure out what to display to the screen.
 *
 * @param {array} content - Array of content to iterate through
 * @param {Component} component - Component to read the stdout writer from
 */
function writeArray(content, component) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = content[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var element = _step.value;

      switch (typeof element === 'undefined' ? 'undefined' : _typeof(element)) {
        case 'string':
          write(element, component);
          break;

        case 'function':
          // write('\n');
          element();
          break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
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

var Component = (function (_EventEmitter) {
  _inherits(Component, _EventEmitter);

  _createClass(Component, null, [{
    key: 'display',
    value: function display(component) {
      var content = component._content;

      if (Array.isArray(content)) {
        writeArray(content, component);
      } else {
        write(content, component);
      }
    }
  }, {
    key: 'mount',
    value: function mount(component) {
      component.componentWillMount();
      component.renderComponent();
      Component.display(component);
      component.componentDidMount();
    }

    /**
     * Constructor
     * Initializes the component instance
     *
     * @constructor
     * @param {object} props - Initial component properties
     */

  }]);

  function Component(props) {
    _classCallCheck(this, Component);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Component).call(this));

    _this.state = {};
    _this.props = {};
    _this._listeners = [];
    _this._hasRendered = false;
    _this._content = null;

    _this.props = _this.getDefaultProps();

    // If we have props extend our default props with it
    if (props) {
      Object.assign(_this.props, props);
    }

    _this.state = _this.getInitialState();
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

  _createClass(Component, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
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

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
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

  }, {
    key: 'componentShouldUpdate',
    value: function componentShouldUpdate(nextProps, nextState) {
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

  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
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

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
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

  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps, nextState) {
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

  }, {
    key: 'getDefaultProps',
    value: function getDefaultProps() {
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

  }, {
    key: 'getInitialState',
    value: function getInitialState() {
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

  }, {
    key: 'forceUpdate',
    value: function forceUpdate(callback) {
      this.componentWillUpdate(this.props, this.state);
      this.renderComponent();
      this.componentDidUpdate(this.props, this.state);

      /** Call the callback supplying this context */
      if (typeof callback === 'function') {
        callback.call(this);
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

  }, {
    key: 'listenTo',
    value: function listenTo(obj, event, callback) {
      var context = arguments.length <= 3 || arguments[3] === undefined ? this : arguments[3];

      /** Keep track of what we're listening to */
      var listener = createListener(obj, event, callback, context);

      this._listeners.push(listener);
      obj.on(event, listener.handler);
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

  }, {
    key: 'listenToOnce',
    value: function listenToOnce(obj, event, callback) {
      var _this2 = this;

      var context = arguments.length <= 3 || arguments[3] === undefined ? this : arguments[3];

      var listener = createListener(obj, event, callback, context);

      this._listeners.push(listener);

      obj.once(event, function () {
        /** Remove this from our list of listeners */
        _this2.stopListening(obj, event, callback);
        listener.handler.apply(listener, arguments);
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

  }, {
    key: 'off',
    value: function off(event, callback) {
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

  }, {
    key: 'on',
    value: function on(event, callback) {
      var context = arguments.length <= 2 || arguments[2] === undefined ? this : arguments[2];

      var listener = createListener(this, event, callback, context);

      this._listeners.push(listener);
      return _get(Object.getPrototypeOf(Component.prototype), 'on', this).call(this, event, listener.handler);
    }

    /**
     * Once
     * Small ovveride to track the listeners this component has going on
     *
     * @method
     * @public
     * @param {string} event - Name of the event to listen to
     * @param {function} callback - Event handler
     * @param {context} [context] - Optional context to call handler with
     * @returns {*} Result of listener being added
     */

  }, {
    key: 'once',
    value: function once(event, callback) {
      var context = arguments.length <= 2 || arguments[2] === undefined ? this : arguments[2];

      var listener = createListener(this, event, callback, context);

      this._listeners.push(listener);
      return _get(Object.getPrototypeOf(Component.prototype), 'once', this).call(this, event, listener.handler);
    }

    /**
     * Remove
     * Removes the component from the UI
     *
     * @method
     * @public
     */

  }, {
    key: 'remove',
    value: function remove() {
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

  }, {
    key: 'render',
    value: function render() {
      throw new Error('Component must implement a render method.');
    }

    /**
     * Render Component
     * Renders the output of the render method to console
     *
     * @method
     * @public
     */

  }, {
    key: 'renderComponent',
    value: function renderComponent() {
      var content = this.render();

      if (!Array.isArray(content)) {
        content += '\n';
      }

      this._content = content;
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

  }, {
    key: 'set',
    value: function set(key, data, callback) {
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
        callback.call(this);
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

  }, {
    key: 'setProps',
    value: function setProps(data, callback) {
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

  }, {
    key: 'setState',
    value: function setState(data, callback) {
      this.set('state', data, callback);
    }

    /**
     * Stop Listening
     * Query the event listeners by the given criteria and remove them
     *
     * @method
     * @public
     * @param {...*} criteria - Obj, event, callback context to search for
     */

  }, {
    key: 'stopListening',
    value: function stopListening() {
      var _this3 = this;

      var criteria = {},
          listeners = this._listeners.slice(),
          names = ['obj', 'event', 'callback', 'context'];

      /** For truthy values attach them to the criteria object */

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
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
        listener.obj.removeListener(listener.event, listener.handler);
        _this3._listeners.splice(_this3._listeners.indexOf(listener), 1);
      });
    }
  }]);

  return Component;
})(_events2.default);

exports.default = Component;