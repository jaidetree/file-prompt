/* eslint no-unused-vars: 0 */
import _ from 'underscore';
import EventEmitter from 'events';

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
function createListener (obj, event, callback, context) {
  let handler = callback.bind(context);

  return {
    id: _.uniqueId('l'),
    obj,
    event,
    handler,
    callback,
    context
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
function write (content, component) {
  let writer = component.props.stdout || process.stdout;

  writer.write(content);
}

/**
 * Write Array
 * Iterates through the array to figure out what to display to the screen.
 *
 * @param {array} content - Array of content to iterate through
 * @param {Component} component - Component to read the stdout writer from
 */
function writeArray (content, component) {
  for (let element of content) {
    switch (typeof element) {
    case 'string':
      write(element, component);
      break;

    case 'function':
      // write('\n');
      element();
      break;
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
class Component extends EventEmitter {

  state = {};
  props = {};
  _listeners = [];
  _hasRendered = false;
  _content = null;

  static display (component) {
    let content = component._content;

    if (Array.isArray(content)) {
      writeArray(content, component);
    }
    else {
      write(content, component);
    }
  }

  static mount (component) {
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
  constructor (props) {
    super();
    this.props = this.getDefaultProps();

    // If we have props extend our default props with it
    if (props) {
      Object.assign(this.props, props);
    }

    this.state = this.getInitialState();
  }

  /**
   * Component Did Mount
   * Component was just rendered to the screen
   *
   * @method
   * @private
   * @returns {void}
   */
  componentDidMount () {
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
  componentDidUpdate (prevProps, prevState) {
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
  componentShouldUpdate (nextProps, nextState) {
    return !_.isEqual(nextState, this.state);
  }

  /**
   * Component Will Mount
   * Component is about to be rendered
   *
   * @method
   * @private
   * @returns {void}
   */
  componentWillMount () {
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
  componentWillUnmount () {
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
  componentWillUpdate (nextProps, nextState) {
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
  getDefaultProps () {
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
  getInitialState () {
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
  forceUpdate (callback) {
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
  listenTo (obj, event, callback, context = this) {
    /** Keep track of what we're listening to */
    let listener = createListener(obj, event, callback, context);

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
  listenToOnce (obj, event, callback, context=this) {
    let listener = createListener(obj, event, callback, context);

    this._listeners.push(listener);

    obj.once(event, (...args) => {
      /** Remove this from our list of listeners */
      this.stopListening(obj, event, callback);
      listener.handler(...args);
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
  off (event, callback, context=this) {
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
  on (event, callback, context=this) {
    let listener = createListener(this, event, callback, context);

    this._listeners.push(listener);
    return super.on(event, listener.handler);
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
  once (event, callback, context=this) {
    let listener = createListener(this, event, callback, context);

    this._listeners.push(listener);
    return super.once(event, listener.handler);
  }

  /**
   * Remove
   * Removes the component from the UI
   *
   * @method
   * @public
   */
  remove () {
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
  render () {
    throw new Error('Component must implement a render method.');
  }

  /**
   * Render Component
   * Renders the output of the render method to console
   *
   * @method
   * @public
   */
  renderComponent () {
    let content = this.render();

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
  set (key, data, callback) {
    let prev = {
          props: _.clone(this.props),
          state: _.clone(this.state)
        },
        next = {
          props: _.clone(this.props),
          state: _.clone(this.state)
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
    }
    else {
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
  setProps (data, callback) {
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
  setState (data, callback) {
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
  stopListening (...args) {
    let criteria = {},
        listeners = this._listeners.slice(),
        names = ['obj', 'event', 'callback', 'context'];

    /** For truthy values attach them to the criteria object */
    if (args.length > 0) {
      args.forEach((arg, i) => {
        if (arg) {
          criteria[names[i]] = arg;
        }
      });
    }

    /** Filter the listeners to what matches the criteria */
    if (Object.keys(criteria).length > 0) {
      listeners = _.where(listeners, criteria);
    }

    /** Tell the obj to stop listening for events */
    listeners.forEach((listener) => {
      listener.obj.removeListener(listener.event, listener.handler);
      this._listeners.splice(this._listeners.indexOf(listener), 1);
    });
  }

}

export default Component;
