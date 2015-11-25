'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = require('redux');

var _actions = require('./actions');

/**
 * Config
 * Reducer for the config.property
 *
 * @param {object} state - Config property of the state object
 * @param {object} action - Action being performed on the config object
 * @returns {object} New config object to store in state
 */
/* eslint camelcase: 0 */
function config() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case _actions.SET_CONFIG:
      return Object.assign({}, state, action.config);

    default:
      return state;
  }
}

/**
 * Current Page
 * Updates info about the current page being displayed
 *
 * @param {object} state - Current page obj including the name, props, and if
 *                         we are navigating.
 * @param {object} action - Container of the action taking place & related
 *                          data to update the state with
 * @returns {object} Updated current page info
 */
function currentPage() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? { name: 'index', props: {}, is_navigating: false } : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case _actions.NAVIGATE:
      return { name: action.name, props: action.props, is_navigating: true };

    case _actions.NAVIGATE_COMPLETE:
      return { name: state.name, props: state.props, is_navigating: false };

    default:
      return state;
  }
}

/**
 * Files
 * Adds or removes files from the global file store
 *
 * @param {array} state - List of absolute paths
 * @param {object} action - Data and info about what action to take
 * @returns {array} New list of files
 */
function files() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  var action = arguments[1];

  var newState = state.slice();

  switch (action.type) {
    case _actions.ADD_FILE:
      if (state.indexOf(action.file) > -1) return state;

      return state.concat([action.file]);

    case _actions.REMOVE_FILE:
      if (state.indexOf(action.file) === -1) return state;
      newState.splice(state.indexOf(action.file), 1);

      return newState;

    default:
      return state;
  }
}

/**
 * Filter
 * Updates the current filter for finding a specific type of file
 *
 * @param {string} state - The filter to be used
 * @param {object} action - Which action to apply to the filter
 * @returns {string} New filter
 */
function filter() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? '**/*.js' : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case _actions.SET_FILTER:
      return action.filter;

    default:
      return state;
  }
}

var reducers = (0, _redux.combineReducers)({ config: config, currentPage: currentPage, files: files, filter: filter });

exports.default = reducers;