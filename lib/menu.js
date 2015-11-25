'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _column = require('./util/column');

var _column2 = _interopRequireDefault(_column);

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _query = require('./query');

var _query2 = _interopRequireDefault(_query);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ITEMS_PER_ROW = 4,
    MAX_COLUMN_LENGTH = 20;

/**
 * Menu
 * Represents a selection of menu options. This class shows a list of
 * horizontal main menu options in columns.
 *
 * @class Menu
 * @extends {Component}
 */

var Menu = (function (_Component) {
  _inherits(Menu, _Component);

  /**
   * Constructor
   * Initializes the menu component
   *
   * @constructor
   * @param {object} props - Initial component properties
   */

  function Menu(props) {
    _classCallCheck(this, Menu);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Menu).call(this, props));
  }

  /**
   * Get Default Props
   * Returns get default props
   *
   * @method
   * @public
   * @returns {object} Default properties for the menu instance
   */

  _createClass(Menu, [{
    key: 'getDefaultProps',
    value: function getDefaultProps() {
      return {
        options: [],
        canUnselect: false,
        acceptsMany: false,
        stdout: process.stdout,
        stdin: process.stdin
      };
    }
  }, {
    key: 'getInitialState',
    value: function getInitialState() {
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

  }, {
    key: 'each',
    value: function each(callback) {
      var context = arguments.length <= 1 || arguments[1] === undefined ? this : arguments[1];

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

  }, {
    key: 'find',
    value: function find(searchFor, processor) {
      var _this2 = this;

      // Return a promise containing the selected ids or reject if invalid
      return new Promise(function (resolve, reject) {
        var queries = [],
            selections = [];

        if (searchFor.trim() === "") {
          return resolve({ selectedItems: [{
              action: null,
              value: null
            }], queryCount: 1 });
        }

        // If the searchFor pattern is invalid then reject
        if (!_query2.default.isValid(searchFor)) {
          return _this2.error(searchFor, reject);
        }

        // Create the queries from the search for pattern.
        queries = _query2.default.createFrom(searchFor);

        if (queries.length > 1 && !_this2.props.acceptsMany) {
          reject(new Error('no_match'));
        }

        // Run those queries through a processor
        if (processor && typeof processor === 'function') {
          queries = processor(queries) || [];
        }

        selections = _this2.processQueries(queries, reject);

        /**
         * No selections were made at all so lets throw an error and reject
         * this promise.
         */

        if (!selections.length) throw new Error('no_match');

        resolve({ selectedItems: selections, queryCount: queries.length });
      }).catch(function (e) {
        switch (e.message || e) {
          case 'no_match':
            _this2.props.stdout.write(_this2.formatError(searchFor));
            break;

          default:
            _this2.props.app.emit('error', e);
            _this2.props.stdin.pause();
            _this2.props.stdout.write('\n' + (e.stack || e.message) + '\n');
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

  }, {
    key: 'findByName',
    value: function findByName(query) {
      var results = this.filter(function (option) {
        return query.isStartOf(option.name);
      });

      /**
       * If the results are 0 or more than 1 return an empty array because
       * name searches need to match only 1 item to be valid.
       */
      if (results.length !== 1) return [];

      return results.map(function (option) {
        return option.id;
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

  }, {
    key: 'filter',
    value: function filter(callback) {
      var context = arguments.length <= 1 || arguments[1] === undefined ? this : arguments[1];

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

  }, {
    key: 'formatError',
    value: function formatError(searchFor) {
      var cleanStr = (0, _stripAnsi2.default)(searchFor);

      if (cleanStr) {
        cleanStr = '(' + cleanStr + ')';
      }

      return _chalk2.default.red.bold('Huh ' + cleanStr + '?\n');
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

  }, {
    key: 'getOptionValue',
    value: function getOptionValue(id) {
      return this.filter(function (opt) {
        return opt.id === id;
      })[0].value;
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

  }, {
    key: 'hasOption',
    value: function hasOption(id) {
      return this.options().map(function (option) {
        return option.id;
      }).indexOf(Number(id)) > -1;
    }

    /**
     * Options
     * Returns the array of options
     *
     * @method
     * @public
     * @returns {array} Array of menu options
     */

  }, {
    key: 'options',
    value: function options() {
      return this.state.options;
    }

    /**
     * Process Queries
     * Processes all the queries to build them into selections
     *
     * @method
     * @public
     * @param {array} queries - An array of Query class instances
     * @returns {array} Array of selections & unselections to make.
     */

  }, {
    key: 'processQueries',
    value: function processQueries(queries) {
      var _this3 = this;

      var selections = [],
          hasErrors = false;

      queries.forEach(function (query) {
        var _query$data = query.data;
        var type = _query$data.type;
        var action = _query$data.action;
        var value = _query$data.value;
        var data = undefined;

        if (action === 'unselect' && !_this3.props.canUnselect) {
          hasErrors = true;
          throw new Error('no_match');
        }

        // Go by type of action
        switch (type) {

          case 'all':
            if (!_this3.props.acceptsMany) {
              hasErrors = true;
              throw new Error('no_match');
            }

            data = _this3.options().map(function (opt) {
              return opt.id;
            });
            break;

          /**
           * If it's a range generate a range of ids which get filtered by if
           * an option has that id or not.
           */
          case 'range':
            if (!_this3.props.acceptsMany) {
              hasErrors = true;
              throw new Error('no_match');
            }
            data = _this3.range(value.min, value.max);
            break;

          /**
           * If it is just an id then make sure an option by that id exists
           * and if so return an array that contains that id otherwise an
           * empty array to be used later
           */
          case 'id':
            if (_this3.hasOption(value)) {
              data = [value];
            } else {
              hasErrors = true;
              return;
            }

            break;

          /**
           * If it is a string find options by that name but note this method
           * will only return results when only one option is found.
           */
          case 'string':
            data = _this3.findByName(query);
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

        data = data.map(function (id) {
          return {
            action: action,
            id: id,
            type: type,
            value: _this3.getOptionValue(id)
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

  }, {
    key: 'range',
    value: function range(min, max) {
      return Array.apply(null, Array(max + 1 - min)).map(function (value, i) {
        return i + min;
      }).filter(this.hasOption, this);
    }

    /**
     * Set Options
     * Update this component's options collection
     *
     * @method
     * @public
     * @param {object} options - New options to display & filter
     */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      this.setState({ options: options });
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

  }, {
    key: 'renderLabel',
    value: function renderLabel(label) {
      return '' + _chalk2.default.magenta.bold(label.slice(0, 1)) + label.slice(1);
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

  }, {
    key: 'renderOption',
    value: function renderOption(option, i) {
      var isLastInRow = (i + 1) % ITEMS_PER_ROW === 0,
          text = '  ' + option.id + ': ' + this.renderLabel(option.label);

      text = (0, _column2.default)(text, MAX_COLUMN_LENGTH);

      return text + ' ' + (isLastInRow ? '\n' : '');
    }

    /**
     * Render
     *
     * @returns {string} All the menu options
     */

  }, {
    key: 'render',
    value: function render() {
      return this.state.options.map(this.renderOption, this).join('');
    }
  }]);

  return Menu;
})(_component2.default);

exports.default = Menu;