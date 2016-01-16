import BaseTransform from './base_transform';
import path from 'path';

/**
 * Range
 * Slice out a range of indexes from an array.
 *
 * @param {array} ids - List of ids
 * @param {int} min - Minimum index value 1-index based
 * @param {int} max - Up to the maximum
 * @returns {array} Sliced array of ids within the given range
 */
function range (ids, min, max) {
  return ids.slice(min - 1, max);
}

export default class MenuTransform extends BaseTransform {
  name = 'menu';
  filters = {
    creator: 'queries',
    type: 'query',
  };
  choices = [];
  ids = [];
  menu = null;

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
  getParams (options) {
    let canUnselect = options.canUnselect;

    canUnselect = typeof canUnselect === 'undefined' ? true : canUnselect;

    return {
      canUnselect,
    };
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
   * Transform
   * Transforms the incoming search string into a bunch of queries to process
   *
   * @method
   * @public
   * @param {object} transformAction - Transform action from incoming stream
   * @returns {*} Return values are ignored
   */
  transform (transformAction) {
    let { data: query, params } = transformAction,
        { type, action, value } = query.data,
        data = [];

    if (this.isSelectOnly(action)) return this.matchError(query);

    /**
     * Make sure we are adding our own option args to the args we're passing
     * around.
     */
    Object.assign(params, {
      canUnselect: this.params.canUnselect,
    });

    // Determine what to do by the type of action the query is requesting
    switch (type) {

      // User has input a '*' so select all the things
      case 'all':
        if (params.maxQueries > 0) return this.matchError(query);
        data = this.menu.ids().slice();
        break;

      // User has input a range like 1-10 so select those items.
      case 'range':
        if (params.maxQueries > 0) return this.matchError(query);

        // Range should be valid choice id numbers
        if (!this.menu.hasId(value.min) || !this.menu.hasId(value.max)) {
          return this.matchError(query);
        }

        // Slice the range from the list of ids
        data = range(this.menu.ids(), value.min, value.max);
        break;

      // Case is id
      case 'id':
        if (!this.menu.hasId(value)) return this.matchError(query);
        data = [value];
        type = 'single';
        break;

      // Query is a string type so try to find a match by the name
      case 'string':
        data = this.menu.getChoiceByName(query.toString());
        type = 'single';
        break;
    }

    // If no data operations exist then lets bail
    if (!data || !data.length) return this.matchError(query);

    data
      // Double check to make sure we are only working with ids that exist
      .filter(this.menu.hasId, this.menu)
      // Convert the array to a list of choices
      .map(this.menu.getChoiceById, this.menu)
      // for each choice push an action
      .forEach(({ value: choice }) => {
        let isPath = choice.slice(0, 1) === path.sep;

        this.pushAction({
          type: isPath ? 'file' : 'page',
          data: {
            operation: action,
            value: choice,
            type,
          },
          params,
        });
      });
  }
}
