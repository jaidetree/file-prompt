import BaseTransform from './base_transform';
import Query from '../query';

export default class QueriesTransform extends BaseTransform {
  name = 'queries';
  filters = {
    creator: 'prompt',
    type: 'string',
  };

  /**
   * Constructor
   * Constructs the queries transform class.
   *
   * @constructor
   * @param {object} options - Initialization options
   */
  constructor (options={}) {
    super(options);
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
      maxQueries: options.maxQueries || 0,
    };
  }

  /**
   * Is Too Many Queries
   * Tests to see if there are too many queries than is allowed in this
   * step. For instance the main menu we only want to be able to select one
   * option but in the files menu we may want to select multiple files at
   * once.
   *
   * @method
   * @param {array} queries - Array of queries
   * @returns {boolean} True if queries are at an acceptable length
   */
  isTooManyQueries (queries) {
    let length = queries.length;

    return this.params.maxQueries > 0 && length > this.params.maxQueries;
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
    let queries = [],
        searchFor = transformAction.data,
        params = {
          maxQueries: this.params.maxQueries,
        };

    /**
     * If searchFor is completely empty that's ok we just need to stop
     * processing it and pass it down to the next thing
     */
    if (searchFor === "") {
      return this.commit({
        creator: 'menu',  // Create an empty menu selection action
        type: 'action', // As it's not a file just an empty action
        data: {
          operation: 'blank',
          value: null,
        },
        params: {
          queryCount: 1,
        },
      });
    }

    if (!Query.isValid(searchFor)) return this.matchError(searchFor);

    /** Update the queries options */
    queries = Query.createFrom(searchFor);

    /**
     * Test to see if there is a maxQueries option set and if it is greater
     * than zero then make sure the number of resulting queries is within
     * that range.
     */
    if (this.isTooManyQueries(queries)) return this.matchError(searchFor);

    // Update the query count so it's available
    params.queryCount = queries.length;

    // For each query push it down the stream
    queries.forEach((query) => {
      this.pushAction({
        type: 'query',
        data: query,
        params,
      });
    });
  }
}
