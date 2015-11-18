import colors from 'chalk';
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
class Menu extends Component {

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
   * Each
   * Iterates through each option
   *
   * @method
   * @public
   * @param {function} callback - Callback to iterate on each item
   * @param {object} context - Context to apply to callback
   * @returns {object} Self to chain other stuff at the end
   */
  each (callback, context=this) {
    this.options().forEach(callback, context);
    return this;
  }

  /**
   * Find
   * Looks for an option with the given input
   *
   * @method
   * @public
   * @param {string} searchFor - Search for
   * @returns {Promise} Returns a promise object
   */
  find (searchFor) {
    let query = String(searchFor).toLowerCase();

    return new Promise((resolve, reject) => {
      let error = () => {
        console.log(colors.red.bold(`Huh (${searchFor})?`));
        reject(query);
      };

      if (!query) error();

      this.each((option) => {
      });
    });
  }

  /**
   * Find By Name
   * Searches through all our options looking for 
   *
   * @param {string} query - Query to search for
   * @param {function} resolve - The promise resolver to call
   */
  findByName (query, resolve) {
    this.filter((option) => {

    });
  }

  /**
   * Filter
   * Iterates through each option and returns a new array
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
   * Returns a
   */
  options () {
    return this.props.options;
  }

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
        column = `  ${option.id}: ${this.renderLabel(option.label)}`,
        spacer = ' ';

    spacer = spacer.repeat(MAX_COLUMN_LENGTH - colors.stripColor(column).length);

    return `${column}${spacer}${isLastInRow ? '\n' : ''}`;
  }

  /**
   * Render
   *
   * @returns {string} All the menu options
   */
  render () {
    return this.props.options.map(this.renderOption, this).join('');
  }
}

export default Menu;
