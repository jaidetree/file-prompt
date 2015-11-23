import { combineReducers } from 'redux';
import { ADD_FILE, REMOVE_FILE, NAVIGATE, SET_CONFIG, SET_PATH } from './actions';

function files (state = [], action) {
  switch (action.type) {
  case ADD_FILE:
    let newState = state.slice();

    newState.push(action.file);

    return newState;

  case REMOVE_FILE:
    return state.slice().splice(state.indexOf(action.file), 1);

  default:
    return state;
  }
}

function currentPage (state = { name: 'index', props: {} }, action) {
  switch (action.type) {
  case NAVIGATE:
    return { name: action.name, props: action.props };

  default:
    return state;
  }
}

function config (state = {}, action) {
  switch (action.type) {
  case SET_CONFIG:
    return Object.assign({}, state, action.config);

  default:
    return state;
  }
}

function path (state = "", action) {
  switch (action.type) {
  case SET_PATH:
    return action.path;

  default:
    return state;
  }
}

const reducers = combineReducers({ files, currentPage, config, path });

export default reducers;
