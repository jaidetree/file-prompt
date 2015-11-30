import Component from './component';
import bindMethods from './util/bind_methods';
import { navigate } from './actions';

/**
 * Page
 * A single UI page
 *
 * @class
 */
export default class Page extends Component {
  /**
   * Constructor
   * Initializes the page class
   *
   * @constructor
   * @param {object} props - Contains this instance's initial properties
   */
  constructor (props) {
    super(props);
    bindMethods(this,
      'errorHandler',
      'pipeTo',
      'reprompt',
      'route',
      'showPrompt'
    );
  }

  /**
   * Get Default Props
   * Returns default properties for this component instance
   *
   * @method
   * @public
   * @returns {object} Default component properties
   */
  getDefaultProps () {
    return {
      stdin: process.stdin,
      stdout: process.stdout
    };
  }

  /**
   * Get Initial State
   * Returns an object to be used as this component's initial state
   *
   * @method
   * @private
   * @returns {object} Initial component state object
   */
  getInitialState () {
    return {
      selected: []
    };
  }

  /**
   * Dispatch
   * Dispatches the targeted action
   *
   * @method
   * @public
   * @param {object} action - Dispatches the given action object
   * @returns {*} The result of the dispatch call
   */
  dispatch (action) {
    return this.props.store.dispatch(action);
  }

  /**
   * Error Handler
   * Emit an error event on serious errors.
   *
   * @method
   * @public
   * @param {Error} e - Error instance thrown or caught
   */
  errorHandler (e) {
    this.props.app.emmit('error', e);
  }

  /**
   * Get Basedir
   * Returns the basedir from props or what is in the app state's config
   *
   * @method
   * @public
   * @returns {string} Basedir path
   */
  getBasedir () {
    return this.props.base || this.select('config.base');
  }

  /**
   * Get Glob
   * Returns the glob filter prop or reads from global store
   *
   * @method
   * @public
   * @returns {string} The found glob string
   */
  getGlob () {
    return this.props.glob || this.select('glob');
  }

  /**
   * Navigate
   * Navigates to another page
   *
   * @method
   * @public
   * @param {string} page - Target page name to navigate to
   * @param {object} props - Extra props to pass into the next page
   */
  navigate (page, props = {}) {
    this.dispatch(navigate(page, props));
  }

  /**
   * Pipe To
   * Convienence method to restart the prompt as a last step
   *
   * @method
   * @public
   * @param {Stream} stream - A stream instance to add listeners to
   * @returns {Stream} The stream with listeners added
   */
  pipeTo (stream) {
    return stream
      .on('restart', this.reprompt);
  }

  /**
   * Reprompt
   * Shows the intro and the menu
   *
   * @method
   * @public
   */
  reprompt () {
    this.renderComponent();
    Page.display(this);
  }

  /**
   * Select
   * Selects data form the global app state
   *
   * @method
   * @public
   * @param {string} keystr - Name of the key to get period (.) separated
   * @returns {*} Data stored in the state for that key string
   */
  select (keystr) {
    let result = this.props.store.getState();

    keystr.split('.').map((key) => {
      result = result[key];
    });

    return result;
  }

  /**
   * Render
   * Returns a string with the rendered content
   *
   * @method
   * @content
   * @returns {string} Content to render
   */
  render () {
    let content = [];

    if (this.renderIntro) {
      content.push(this.renderIntro());
    }

    if (this.renderMenu) {
      content.push(this.renderMenu());
    }

    if (this.renderPrompt) {
      content.push(this.renderPrompt());
    }

    return content;
  }

}
