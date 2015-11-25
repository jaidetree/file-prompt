import colors from 'chalk';
import column from './util/column';
import Component from './component';
import Query from './query';
import stripAnsi from 'strip-ansi';

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
      canUnselect: false,
      acceptsMany: false,
      stdout: process.stdout,
      stdin: process.stdin
    };
  }

  getInitialState () {
    return {
      options: this.props.options || []
    };
  }

  /** HELPER METHODS */

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
   * @param {function} [processor] - A query processor to further filter the
   *                               the queries.
   * @returns {Promise} Returns a promise object
   */
  find (searchFor, processor) {
    // Return a promise containing the selected ids or reject if invalid
    return new Promise((resolve, reject) => {
      let queries = [],
          selections = [];

      if (searchFor.trim() === "") {
        return resolve({ selectedItems: [{
          action: null,
          value: null
        }], queryCount: 1 });
      }

      // If the searchFor pattern is invalid then reject
      if (!Query.isValid(searchFor)) {
        return this.error(searchFor, reject);
      }

      // Create the queries from the search for pattern.
      queries = Query.createFrom(searchFor);

      if (queries.length > 1 && !this.props.acceptsMany) {
        reject('no_match');
      }

      // Run those queries through a processor
      if (processor && typeof processor === 'function') {
        queries = processor(queries) || [];
      }

      selections = this.processQueries(queries, reject);

      /**
       * No selections were made at all so lets throw an error and reject
       * this promise.
       */

      if (!selections.length) throw new Error('no_match');

      resolve({ selectedItems: selections, queryCount: queries.length });
    })
    .catch((e) => {
      switch (e.message) {
      case 'no_match':
        this.props.stdout.write(this.formatError(searchFor));
        break;

      default:
        process.stderr.write((e.stack || e.message) +'\n');
        break;
      }

      throw e;
    });
  }

  /**
   * Find By Name
   * Searches through all our options looking for
   *
   * @param {Query} query - Query to search for
   * @returns {array} Array of matching ids
   */
  findByName (query) {
    let results = this.filter((option) => query.isStartOf(option.name));

    /**
     * If the results are 0 or more than 1 return an empty array because
     * name searches need to match only 1 item to be valid.
     */
    if (results.length !== 1) return [];

    return results.map((option) => option.id);
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
   * Format Error
   * Formats an error message to display to the user
   *
   * @method
   * @public
   * @param {string} searchFor - Original search param
   * @returns {string} Formatted error message
   */
  formatError (searchFor) {
    let cleanStr = stripAnsi(searchFor);

    if (cleanStr) {
      cleanStr = `(${cleanStr})`;
    }

    return colors.red.bold(`Huh ${cleanStr}?\n`);
  }

  /**
   * Get Option Value
   * Returns the value for the option of the given id.
   *
   * @method
   * @public
   * @param {int} id - Id to search for
   * @returns {string} Value property of the given option id
   */
  getOptionValue (id) {
    return this.filter((opt) => opt.id === id)[0].value;
  }

  /**
   * Has Option
   * Determine if an option with the given id exists
   *
   * @method
   * @public
   * @param {int} id - Id to search for
   * @returns {boolean} If menu options contain option with that id
   */
  hasOption (id) {
    return this.options().map((option) => option.id).indexOf(Number(id)) > -1;
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

  processQueries (queries) {
    let selections = [],
        hasErrors = false;

    queries.forEach((query) => {
      let { type, action, value } = query.data,
          data;

      if (action === 'unselect' && !this.props.canUnselect) {
        hasErrors = true;
        throw new Error('no_match');
      }

      // Go by type of action
      switch (type) {

      case 'all':
        if (!this.props.acceptsMany) {
          hasErrors = true;
          throw new Error('no_match');
        }

        data = this.options().map((opt) => opt.id);
        break;

      /**
       * If it's a range generate a range of ids which get filtered by if
       * an option has that id or not.
       */
      case 'range':
        if (!this.props.acceptsMany) {
          hasErrors = true;
          throw new Error('no_match');
        }
        data = this.range(value.min, value.max);
        break;

      /**
       * If it is just an id then make sure an option by that id exists
       * and if so return an array that contains that id otherwise an
       * empty array to be used later
       */
      case 'id':
        if (this.hasOption(value)) {
          data = [value];
        }
        else {
          hasErrors = true;
          return;
        }

        break;

      /**
       * If it is a string find options by that name but note this method
       * will only return results when only one option is found.
       */
      case 'string':
        data = this.findByName(query);
        break;
      }

      /**
       * If no data or it has a falsey length property then show an error
       * message. Note the promise will not be rejected but we should
       * tell the user nothing was found by that query param.
       */
      if ((!data || !data.length) && !hasErrors) {
        throw new Error('no_match');
      }

      data = data.map((id) => {
        return {
          action,
          id,
          type,
          value: this.getOptionValue(id)
        };
      });

      // Update the proper selections by the parsed query action
      selections = selections.concat(data);
    });

    return selections;
  }

  /**
   * Range
   * Generate a range of values from min up to max
   *
   * @method
   * @public
   * @param {int} min - Minimum value
   * @param {int} max - Maximum value
   * @returns {array} A range of values from min to max
   */
  range (min, max) {
    return Reflect.apply(Array, null, Array(max))
      .map((value, i) => i + min)
      .filter(this.hasOption, this);
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
    this.setState({ options });
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

export default Menu;
