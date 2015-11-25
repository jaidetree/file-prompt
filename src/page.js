import Component from './component';
import { navigate } from './actions';

/**
 * Page
 * A single UI page
 *
 * @class
 */
class Page extends Component {
  /**
   * Constructor
   * Initializes the page class
   *
   * @constructor
   * @param {object} props - Contains this instance's initial properties
   */
  constructor (props) {
    super(props);
  }

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

export default Page;
