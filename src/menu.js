import colors from 'chalk';
import column from './util/column';
import Component from './component';

const ITEMS_PER_ROW = 4,
      MAX_COLUMN_LENGTH = 20;

/**
 * Menu
 * Represents a selection of menu options. This class shows a list of
 * horizontal main menu options in columns.
 *
 * @class Menu
 * @extends {Component}
 */
export default class Menu extends Component {

  /**
   * Constructor
   * Initializes the menu component
   *
   * @constructor
   * @param {object} props - Initial component properties
   */
  constructor (props) {
    super(props);
  }

  /**
   * Get Default Props
   * Returns get default props
   *
   * @method
   * @public
   * @returns {object} Default properties for the menu instance
   */
  getDefaultProps () {
    return {
      options: [],
      stdout: process.stdout,
      stdin: process.stdin,
    };
  }

  getInitialState () {
    let options = this.props.options;

    return {
      options: options || [],
      ids: options ? options.map((opt) => opt.id) : [],
    };
  }

  /** HELPER METHODS */

  /**
   * Filter
   * Iterates through each chocie and returns a new array
   *
   * @method
   * @public
   * @param {function} callback - Callback to iterate on each item
   * @param {object} [context] - Optional context to send with callback
   * @returns {array} Filtered result arrray
   */
  filter (callback, context=this) {
    return this.options().filter(callback, context);
  }

  /**
   * Get Choice By Id
   * Returns a choice by the given id
   *
   * @method
   * @public
   * @param {int} id - Id to search through choices for
   * @returns {object} Choice by that given id
   */
  getChoiceById (id) {
    /**
     * Throw a serious error if this fails, it is only used internally
     */
    if (!this.hasId(id)) {
      throw new Error(`Menu.getChoiceById: Could not find chocie by id "${id}"`);
    }
    return this.options()[this.state.ids.indexOf(id)];
  }

  /**
   * Get Id By Name
   * Searches through all our options looking for
   *
   * @param {string} name - Name partial to find
   * @returns {array} Array of matching ids
   */
  getIdByName (name) {
    let results = this.filter((option) => option.name.startsWith(name));

    /**
     * If the results are 0 or more than 1 return an empty array because
     * name searches need to match only 1 item to be valid.
     */
    if (results.length !== 1) return [];

    return results.map((option) => option.id);
  }

  /**
   * Has Id
   * Returns boolean if a choice by that id exists.
   *
   * @method
   * @public
   * @param {int} id - Id to look for
   * @returns {boolean} True if id was found
   */
  hasId (id) {
    return this.state.ids.indexOf(Number(id)) > -1;
  }

  /**
   * Ids
   * Returns a list of ids from the state
   *
   * @method
   * @public
   * @returns {array} Array of option ids
   */
  ids () {
    return this.state.ids;
  }

  /**
   * Map
   * Iterates through each choice and returns a new array of the same size
   *
   * @param {function} callback - Callback to iterate on each item
   * @param {object} [context] - Optional context to send with callback
   * @returns {array} Mapped result arrray
   */
  map (callback, context=this) {
    return this.options().map(callback, context);
  }

  /**
   * Options
   * Returns the array of options
   *
   * @method
   * @public
   * @returns {array} Array of menu options
   */
  options () {
    return this.state.options;
  }

  /**
   * Set Options
   * Update this component's options collection
   *
   * @method
   * @public
   * @param {object} options - New options to display & filter
   */
  setOptions (options) {
    this.setState({
      options,
      ids: options.map((opt) => opt.id),
    });
  }

  /** RENDER METHODS */

  /**
   * Render Label
   * Formats the label for horizontal menus
   *
   * @method
   * @public
   * @param {string} label - Label to format
   * @returns {string} Formatted label
   */
  renderLabel (label) {
    return `${colors.magenta.bold(label.slice(0, 1))}${label.slice(1)}`;
  }

  /**
   * Render Option
   * Render the menu option
   *
   * @method
   * @public
   * @param {object} option - The option to render
   * @param {int} i - Index to test for things with
   * @returns {string} Formatted option
   */
  renderOption (option, i) {
    let isLastInRow = (i + 1) % ITEMS_PER_ROW === 0,
        text = `  ${option.id}: ${this.renderLabel(option.label)}`;

    text = column(text, MAX_COLUMN_LENGTH);

    return `${text} ${isLastInRow ? '\n' : ''}`;
  }

  /**
   * Render
   *
   * @returns {string} All the menu options
   */
  render () {
    return this.state.options.map(this.renderOption, this).join('');
  }
}
