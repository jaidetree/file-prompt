/* eslint camelcase: 0 */
import { combineReducers } from 'redux';
import { ADD_FILE, REMOVE_FILE, NAVIGATE, NAVIGATE_COMPLETE, SET_CONFIG, SET_FILTER } from './actions';

/**
 * Config
 * Reducer for the config.property
 *
 * @param {object} state - Config property of the state object
 * @param {object} action - Action being performed on the config object
 * @returns {object} New config object to store in state
 */
function config (state = {}, action) {
  switch (action.type) {
    case SET_CONFIG:
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
function currentPage (state = { name: 'index', props: {}, isNavigating: false }, action) {
  switch (action.type) {
    case NAVIGATE:
      return { name: action.name, props: action.props, isNavigating: true };

    case NAVIGATE_COMPLETE:
      return { name: state.name, props: state.props, isNavigating: false };

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
function files (state = [], action) {
  let newState = state.slice();

  switch (action.type) {
    case ADD_FILE:
      if (state.indexOf(action.file) > -1) return state;

      return state.concat([action.file]);

    case REMOVE_FILE:
      if (state.indexOf(action.file) === -1) return state;
      newState.splice(state.indexOf(action.file), 1);

      return newState;

    default:
      return state;
  }
}

/**
 * Glob
 * Updates the current glob filter for finding a specific type of file
 *
 * @param {string} state - The filter to be used
 * @param {object} action - Which action to apply to the filter
 * @returns {string} New filter
 */
function glob (state = '**/*.js', action) {
  switch (action.type) {
    case SET_FILTER:
      return action.glob;

    default:
      return state;
  }
}

const reducers = combineReducers({ config, currentPage, files, glob });

export default reducers;
