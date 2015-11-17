import Component from './component';

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
   * Select items
   * Updates the state with the selected items.
   *
   * @method
   * @public
   * @param {array} options - List of options to select from
   * @param {int|array} selectedIndexes - List of items to select
   * @returns {array} The new list of selected items
   */
  selectItems (options, selectedIndexes) {
    let selected = [],
        chosen = selectedIndexes;

    /**
     * Error
     * A reusble function to throw an error
     */
    function error () {
      throw new Error(`Error:Page.selectItems: Page could not select items ${selectedIndexes.toString()}.`);
    }

    // If chosen is an array, format them all as numbers
    if (chosen && Array.isArray(chosen) && chosen.length) {
      // Convert the selectedIndexes into an array of numeric indexes
      chosen = chosen.map((item) => Number(item));

      // Filter the options into what was selected
      selected = options.filter((option, index) => {
        return chosen.indexOf(index) > -1;
      });

      // Make sure our selected length is not empty.
      if (selected.length === 0) error();
    }

    // If the selected indexes exists but is not an array
    else if (typeof chosen === 'string' || typeof chosen === 'number') {
      // Convert the selected index into a number
      if (typeof chosen === 'string') {
        chosen = Number(chosen);
      }

      // Attempt to push it into the selected array otherwise throw an error
      if (!options[chosen]) {
        error();
      }

      selected.push(options[chosen]);
    }

    // Finally update the state then return the newly selected items.
    this.setState({
      selected
    });

    return selected;
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
      content.push(this.renderOptiosn());
    }

    if (this.renderPrompt) {
      content.push(this.renderPrompt());
    }

    return content.join('');
  }

}

export default Page;
