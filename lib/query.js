'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Map To Object
 * Creates an object out of a keys and values array pair
 *
 * @param {array} keys - Array of key values to use as properties
 * @param {array} values - Array of values to assign to the properties
 * @returns {object} A newly mapped object
 */
function mapToObject(keys, values) {
  var data = {};

  keys.forEach(function (key, i) {
    data[key] = values[i];
  });

  return data;
}

/**
 * Query
 * @class
 * @classdesc It represents search input for a menu option and has a static
 *            method to take input with several comma or space separated
 *            subqueries and turn that into an array of queries.
 */

var Query = (function () {
  _createClass(Query, null, [{
    key: 'createFrom',

    /**
     * Create From
     * Returns a list of separate queries
     *
     * @method
     * @static
     * @param {string} query - Raw query string
     * @returns {array} Array of sub queries
     */
    value: function createFrom(query) {
      // Separates the query into all groupings of strings, numbers, ranges
      // sequences etc... then map them into query instances for testing.
      try {
        return query.split(/,| /g).filter(function (subQuery) {
          // No blanks.
          if (subQuery === '') {
            return false;
          }

          return true;
        })

        // Map them sub queries
        .map(function (subQuery) {
          return new Query(subQuery);
        });
      } catch (e) {
        return [];
      }
    }

    /**
     * Extract Numbers
     * Returns an array of all the numbers in the given str
     *
     * @method
     * @public
     * @param {string} str - Original input string
     * @returns {array|object} Found numbers
     */

  }, {
    key: 'extractNumbers',
    value: function extractNumbers(str) {
      return str.match(/[\d]+/g).map(function (numStr) {
        return Number(numStr);
      });
    }

    /**
     * Is Valid
     * Determines if a str is empty or not
     *
     * @method
     * @public
     * @param {string} str - Str to check validity of
     * @returns {boolean} True if query is a valid string
     */

  }, {
    key: 'isValid',
    value: function isValid(str) {
      return typeof str === 'string' && !!str.trim();
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

  }]);

  function Query(query) {
    _classCallCheck(this, Query);

    this.query = null;
    this.data = {};

    this.rawQueryString = query;

    if (Query.isValid(query)) {
      this.query = String(query).trim().toLowerCase();
      this.data = this.parse();
    }
  }

  /**
   * Extract Numbers
   * An instance method to forward to the static method
   *
   * @method
   * @public
   * @returns {array} Array of Number() formatted numbers
   */

  _createClass(Query, [{
    key: 'extractNumbers',
    value: function extractNumbers() {
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

  }, {
    key: 'is',
    value: function is(str) {
      return str.toLowerCase() === this.query;
    }

    /**
     * Is Asterik
     * If user has input an asterik to select all options
     *
     * @method
     * @public
     * @returns {boolean} If query is a range
     */

  }, {
    key: 'isAsterik',
    value: function isAsterik() {
      return this.query.length <= 2 && /\*$/.test(this.query);
    }

    /**
     * Is Integer
     * Determiens if query is a integer or not
     *
     * @method
     * @public
     * @returns {boolean} If str is an integer
     */

  }, {
    key: 'isInteger',
    value: function isInteger() {
      return Number.isInteger(Number(this.query));
    }

    /**
     * Is Start Of
     * Determines if option name startsWith the query
     *
     * @param {string} str - String to test against
     * @returns {boolean} If query starts with the str
     */

  }, {
    key: 'isStartOf',
    value: function isStartOf(str) {
      return str.toLowerCase().startsWith(this.data.value);
    }

    /**
     * Is Integer
     * Determiens if query is a insteger or not
     *
     * @method
     * @public
     * @returns {boolean} If query is a range
     */

  }, {
    key: 'isRange',
    value: function isRange() {
      return (/[\d]+[\s]*-[\s]*[\d]/g.test(this.query)
      );
    }

    /**
     * Is Valid
     * Determines if a str is empty or not
     *
     * @method
     * @public
     * @returns {boolean} True if query is a valid string
     */

  }, {
    key: 'isValid',
    value: function isValid() {
      return Query.isValid(this.query);
    }

    /**
     * Parse
     * Determine what type of query we are dealing with and what to do
     *
     * @method
     * @public
     * @returns {object} An action this query should take
     */

  }, {
    key: 'parse',
    value: function parse() {
      var data = {
        action: 'select'
      },
          query = this.query;

      // If this is a query to remove something, mark that and remove the
      // negative sign
      if (this.query.slice(0, 1) === '-') {
        data.action = 'unselect';
        query = this.query.slice(1);
      }

      // It's a range of integers so you know... do that.
      if (this.isRange()) {
        data.type = 'range';
        data.value = mapToObject(['min', 'max'], Query.extractNumbers(query));
      }
      // It's an integer so lets check for menu option ids
      else if (this.isInteger()) {
          data.type = 'id';
          data.value = Number(query);
        } else if (this.isAsterik()) {
          data.type = 'all';
        }
        // Guess you're a string then huh?
        else {
            data.type = 'string';
            data.value = query;
          }

      data.query = this.rawQueryString;

      return data;
    }

    /**
     * Raw Query
     * Returns a copy of the raw query string
     *
     * @method
     * @public
     * @returns {string} Raw query string
     */

  }, {
    key: 'rawQuery',
    value: function rawQuery() {
      return String(this.rawQueryString);
    }

    /**
     * To String
     * Returns the query string
     *
     * @method
     * @public
     * @returns {string} Original query string
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.query;
    }
  }]);

  return Query;
})();

exports.default = Query;