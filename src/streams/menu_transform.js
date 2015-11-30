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
    type: 'query'
  };
  choices = [];
  ids = [];

  /**
   * Constructor
   * Constructs the queries transform class.
   *
   * @constructor
   * @param {object} options - Initialization options
   */
  constructor (options={}) {
    super(options);

    if (options.choices) {
      this.choices = options.choices;
      this.ids = this.choices.map((opt) => opt.id);
    }
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
    return {
      canUnselect: typeof options.canUnselect === 'undefined' ? true : false
    };
  }

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
    return this.choices.filter(callback, context);
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
    if (!this.hasId(id)) throw new Error(`MenuTransform.getChoiceById: Could not find chocie by id "${id}"`);
    return this.choices[this.ids.indexOf(id)];
  }

  /**
   * Get Choice By Name
   * Searches through all our options looking for
   *
   * @param {Query} query - Query to search for
   * @returns {array} Array of matching ids
   */
  getChoiceByName (query) {
    let results = this.filter((option) => query.isStartOf(option.name));

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
    return this.ids.indexOf(Number(id)) > -1;
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
   * Map
   * Iterates through each choice and returns a new array of the same size
   *
   * @param {function} callback - Callback to iterate on each item
   * @param {object} [context] - Optional context to send with callback
   * @returns {array} Mapped result arrray
   */
  map (callback, context=this) {
    return this.choices.map(callback, context);
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
      canUnselect: this.params.canUnselect
    });

    // Determine what to do by the type of action the query is requesting
    switch (type) {

      // User has input a '*' so select all the things
      case 'all':
        if (params.maxQueries > 0) return this.matchError(query);
        data = this.ids.slice();
        break;

      // User has input a range like 1-10 so select those items.
      case 'range':
        if (params.maxQueries > 0) return this.matchError(query);

        // Range should be valid choice id numbers
        if (!this.hasId(value.min) || !this.hasId(value.max)) {
          return this.matchError(query);
        }

        // Slice the range from the list of ids
        data = range(this.ids, value.min, value.max);
        break;

      // Case is id
      case 'id':
        if (!this.hasId(value)) return this.matchError(query);
        data = [value];
        type = 'single';
        break;

      // Query is a string type so try to find a match by the name
      case 'string':
        data = this.getChoiceByName(query);
        type = 'single';
        break;
    }

    // If no data operations exist then lets bail
    if (!data || !data.length) return this.matchError(query);

    data
      // Double check to make sure we are only working with ids that exist
      .filter(this.hasId, this)
      // Convert the array to a list of choices
      .map(this.getChoiceById, this)
      // for each choice push an action
      .forEach(({ value: choice }) => {
        let isPath = choice.slice(0, 1) === path.sep;

        this.pushAction({
          type: isPath ? 'file' : 'action',
          data: {
            operation: action,
            value: choice,
            type
          },
          params
        });
      });

    // this.finish();
  }
}
