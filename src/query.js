/**
 * Query
 * @class
 * @classdesc It represents search input for a menu option and has a static
 *            method to take input with several comma or space separated
 *            subqueries and turn that into an array of queries.
 */
export default class Query {

  /**
   * Create From
   * Returns a list of separate queries
   *
   * @method
   * @static
   * @param {string} query - Raw query string
   * @returns {array} Array of sub queries
   */
  static createFrom (query) {
    // Separates the query into all groupings of strings, numbers, ranges
    // sequences etc... then map them into query instances for testing.
    return query.match(/[-\/_a-zA-Z\d]+/g)
      .filter((subQuery) => {
        // No blanks.
        if (subQuery === '') {
          return false;
        }

        return true;
      })

      // Map them sub queries
      .map((subQuery) => {
        return new Query(subQuery);
      });
  }

  /**
   * Extract Numbers
   * Returns an array of all the numbers in the given str
   *
   * @method
   * @public
   * @param {string} str - Original input string
   * @returns {array} Found numbers
   */
  static extractNumbers (str) {
    return str.match(/[\d]+/g).map((numStr) => {
      return Number(numStr);
    });
  }

  /**
   * Constructor
   * Initializes the query interface
   *
   * @method
   * @public
   * @constructor
   * @param {string} query - The raw query string to parse & test with
   */
  constructor (query) {
    this.query = String(query).toLowerCase();
  }

  /**
   * Extract Numbers
   * An instance method to forward to the static method
   *
   * @method
   * @public
   * @returns {array} Array of Number() formatted numbers
   */
  extractNumbers () {
    return Query.extractNumbers(this.query);
  }

  /**
   * Is
   * Determines if str matches the query
   *
   * @method
   * @public
   * @param {string} str - Input string to test against
   * @returns {boolean} If query is the option name
   */
  is (str) {
    return str.toLowerCase() === this.query;
  }

  /**
   * Is Integer
   * Determiens if query is a insteger or not
   *
   * @method
   * @public
   * @returns {boolean} If str is an integer
   */
  isInteger () {
    return Number.isInteger(Number(this.query));
  }

  /**
   * Is Integer
   * Determiens if query is a insteger or not
   *
   * @method
   * @public
   * @returns {boolean} If query is a range
   */
  isRange () {
    return (/[\d]+[\s]*-[\s]*[\d]/g).test(this.query);
  }

  /**
   * Parse
   * Determine what type of query we are dealing with and what to do
   *
   * @method
   * @public
   * @returns {object} An action this query should take
   */
  parse () {
    let data = {
          action: 'add'
        },
        query = this.query;

    // If this is a query to remove something, mark that and remove the
    // negative sign
    if (this.query.slice(0, 1) === '-') {
      data.action = 'subtract';
      query = this.query.slice(1);
    }

    if (this.isRange()) {
      data.type = 'range';
      data.value = Query.extractNumbers(query);
    }

    else if (this.isInteger()) {
      data.type = 'id';
      data.value = Number(query);
    }

    // Guess you're a string then huh?
    else {
      data.type = 'string';
      data.value = query;
    }

    data.query = this.query;

    return data;
  }

  /**
   * Starts With
   * Determines if option name startsWith the query
   *
   * @param {string} str - String to test against
   * @returns {boolean} If query starts with the str
   */
  startsWith (str) {
    return this.query.startsWith(str.toLowerCase());
  }

  /**
   * To String
   * Returns the query string
   *
   * @method
   * @public
   * @returns {string} Original query string
   */
  toString () {
    return this.query;
  }
}
