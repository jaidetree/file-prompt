import colors from 'chalk';
import Component from './component';
import Query from './query';

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
      options: []
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
   * Error
   * Tell the user the input was bad. If a reject method is available it
   * sends an error message otherwise console.log.
   *
   * @method
   * @param {string} searchFor - Original search param
   * @param {function} [reject] - Optional reject callback if in promise
   */
  error (searchFor, reject) {
    let msg = colors.red.bold(`Huh (${searchFor})?`);

    if (reject) reject(new Error(msg), searchFor); else console.log(msg);
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
      let selections = {
            add: [],
            subtract: [],
            updated: false
          },
          hasErrors = false,
          queries;

      if (searchFor.trim() === "") return reject(null);

      // If the searchFor pattern is invalid then reject
      if (!Query.isValid(searchFor)) {
        hasErrors = true;
        return this.error('1000:' + searchFor, reject);
      }

      // Create the queries from the search for pattern.
      queries = Query.createFrom(searchFor);

      // Run those queries through a processor
      if (processor && typeof processor === 'function') {
        queries = processor(queries) || [];
      }

      // For Each
      queries.forEach((query) => {
        let { type, action, value } = query.data,
            data;

        // Go by type of action
        switch (type) {

        /**
         * If it's a range generate a range of ids which get filtered by if
         * an option has that id or not.
         */
        case 'range':
          data = this.range(value.min, value.max);
          break;

        /**
         * If it is just an id then make sure an option by that id exists
         * and if so return an array that contains that id otherwise an
         * empty array to be used later
         */
        case 'id':
          data = this.hasOption(value) ? [value] : [];
          if (data.length === 0) {
            hasErrors = true;
            reject(null);
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
          return this.error('2000:' + query.toString());
        }

        // Update the proper selections by the parsed query action
        selections[action] = selections[action].concat(data);

        // State we have updated selections
        if (!selections.updated) selections.updated = true;
      });

      /**
       * No selections were made at all so lets throw an error and reject
       * this promise.
       */
      // if (!selections.updated && !hasErrors) {
      //   return this.error('3000:' + searchFor);
      // }

      if (!selections.updated) return reject(searchFor);

      resolve(selections.add, selections.subtract);
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
   * Has Option
   * Determine if an option with the given id exists
   *
   * @method
   * @public
   * @param {int} id - Id to search for
   * @returns {boolean} If menu options contain option with that id
   */
  hasOption (id) {
    return this.options().map((option) => option.id).indexOf(id) > -1;
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
    return this.props.options;
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
    return Array(max).map((value, i) => i + min).filter(this.hasOption);
  }

  /**
   * Select
   * Returns an array of options filtered by the chosen ids
   *
   * @method
   * @public
   * @param {array} chosen - An array of chosen item ids
   * @returns {Promise} A promise that is resolved when we have retrieved the
   *                    selected items.
   */
  select (chosen) {
    return new Promise((resolve, reject) => {
      let options;

      if (!chosen || !Array.isArray(chosen) || !chosen.length) {
        return reject(new Error('Menu.Select: No selections were provided.'));
      }

      options = this.options().filter((option) => {
        return chosen.indexOf(option.id) > -1;
      });

      if (!options || !options.length) {
        reject(new Error('Menu.Select: No selections were made.'));
      }

      resolve(options);
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
