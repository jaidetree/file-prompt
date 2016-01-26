import BaseTransform from './base_transform';
import path from 'path';

/**
 * Range
 * Return a populated array with the values from the min to the max.
 *
 * @param {int} min - Minimum index value 1-index based
 * @param {int} max - Up to the maximum
 * @returns {array} Array of numbers from min to max
 */
function range (min, max) {
  let length = max - min,
      rangeArray = Array(length);

  for (let idx = 0; idx <= length; idx += 1, min += 1) {
    rangeArray[idx] = min;
  }

  return rangeArray;
}

export default class MenuTransform extends BaseTransform {
  name = 'menu';
  filters = {
    creator: 'queries',
    type: 'query',
  };
  menu = null;

  /** Lifecycle methods */

  /**
   * Constructor
   * Constructs the queries transform class.
   *
   * @constructor
   * @param {object} options - Initialization options
   */
  constructor (options={}) {
    super(options);

    if (options.menu) this.menu = options.menu;
  }

  /**
   * Get Params
   * Returns the params object to merge with our defaults
   *
   * @method
   * @private
   * @param {object} options - Constructor options
   * @returns {object} Initial param values
   */
  getParams (options={}) {
    let canUnselect = options.canUnselect;

    canUnselect = typeof canUnselect === 'undefined' ? true : canUnselect;

    return {
      canUnselect,
    };
  }

  /** Helpers */

  /**
   * Returns a copy of ids from the menu
   *
   * @returns {array} Array of menu option choice ids
   */
  getChoiceIds () {
    return this.menu.ids().slice();
  }

  /**
   * Is Select Only
   * Determines if unselections are allowed. For instance on the main menu
   * you are just selecting which action to take so -directories is an
   * invalid value.
   *
   * @method
   * @public
   * @param {string} action - Given query action
   * @returns {boolean} True if action was unselect and it's not allowed
   */
  isSelectOnly (action) {
    return action === 'unselect' && !this.params.canUnselect;
  }

  /**
   * Validates the selected choices
   *
   * @param {array} ids - An array of option ids
   * @returns {array} List of menu choices
   */
  isValid (ids=[]) {
    let isLegit = Array.isArray(ids) && ids.every(this.menu.hasId, this.menu);

    return isLegit && ids && ids.length > 0;
  }

  /**
   * Selects choices from the menu based on various query types
   *
   * @param {query} query - A query instance to test values of
   * @param {object} params - Extra params that set constraints on queries
   * @returns {array} Array of selected option ids
   */
  select (query, params) {
    let ids = [],
        data = query.data;

    if (this.isSelectOnly(query.action)) return [];

    /**
     * Make sure we are adding our own option args to the args we're passing
     * around.
     */
    Object.assign(params, { canUnselect: this.params.canUnselect });

    // Determine what to do by the type of action the query is requesting
    switch (data.type) {

      // User has input a '*' so select all the things
      case 'all':
        if (params.maxQueries > 0) return [];
        ids = this.getChoiceIds();
        break;

      // User has input a range like 1-10 so select those items.
      case 'range':
        // If maxQueries is set then ranges are not allowed.
        if (params.maxQueries > 0) return [];

        // Test against invalid values
        if (!data.value.min || !data.value.max) return [];

        // Error if query value.min is greater than the max
        else if (data.value.min > data.value.max) return [];

        // Create a list of ids in the given range
        ids = range(data.value.min, data.value.max);
        break;

      // Case is id
      case 'id':
        if (!query.isInteger()) return [];
        ids = [data.value];
        data.type = 'single';
        break;

      // Query is a string type so try to find a match by the name
      case 'string':
        ids = this.menu.getIdByName(query.toString());
        data.type = 'single';
        break;
    }

    return ids;
  }

  /** Transformer */

  /**
   * Transform
   * Transforms the incoming search string into a bunch of queries to process
   *
   * @method
   * @public
   * @param {object} transformAction - Transform action from incoming stream
   */
  transform (transformAction) {
    let { data: query, params } = transformAction,
        choices = this.select(query, params);

    /**
     * If the list of choices is not valid, push a match error.
     */
    if (!this.isValid(choices)) {
      this.matchError(query);
      return;
    }

    // Start with our choices array
    choices

      // Convert our array of ids into an array of menu option objects
      .map((id) => this.menu.getChoiceById(id).value)

      // Build our action objects for each choice
      .map((choice) => {
        let isPath = choice.slice(0, 1) === path.sep;

        return {
          type: isPath ? 'file' : 'page',
          data: {
            operation: query.action,
            value: choice,
            type: query.type,
          },
          params,
        };
      })

      // Push each action down the stream
      .forEach(this.pushAction, this);
  }
}
