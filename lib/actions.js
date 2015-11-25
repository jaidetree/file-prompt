"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addFile = addFile;
exports.removeFile = removeFile;
exports.navigate = navigate;
exports.navigateComplete = navigateComplete;
exports.setConfig = setConfig;
exports.setFilter = setFilter;
var ADD_FILE = exports.ADD_FILE = "ADD_FILE",
    REMOVE_FILE = exports.REMOVE_FILE = "REMOVE_FILE",
    NAVIGATE = exports.NAVIGATE = "NAVIGATE",
    NAVIGATE_COMPLETE = exports.NAVIGATE_COMPLETE = "NAVIGATE_COMPLETE",
    SET_CONFIG = exports.SET_CONFIG = "SET_CONFIG",
    SET_FILTER = exports.SET_FILTER = "SET_FILTER";

/**
 * Add File
 * Creates an add file action to the global store.
 *
 * @param {string} file - Absolute file path to add to the store
 * @returns {object} Redux action
 */
function addFile(file) {
  return { type: ADD_FILE, file: file };
}

/**
 * Remove File
 * Creates a remove file action to the global store.
 *
 * @param {string} file - Absolute file path to remove from the store
 * @returns {object} Redux action
 */
function removeFile(file) {
  return { type: REMOVE_FILE, file: file };
}

/**
 * Navigate
 * Creates a navigate action to the global store.
 *
 * @param {string} name - Page to navigate to
 * @param {object} props - Props to pass into the next page.
 * @returns {object} Redux action
 */
function navigate(name) {
  var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return { type: NAVIGATE, name: name, props: props };
}

/**
 * Navigate Complete
 * Creates a navigate complete action
 *
 * @returns {object} Redux action
 */
function navigateComplete() {
  return { type: NAVIGATE_COMPLETE };
}

/**
 * Set Config
 * Updates the global config in the store
 *
 * @param {object} options - Options hash to assign onto the store
 * @returns {object} Redux action
 */
function setConfig(options) {
  return { type: SET_CONFIG, options: options };
}

/**
 * Set Filter
 * Updates the global filter attribute on the store
 *
 * @param {string} filter - Filter to use by default '**\/*.js'
 * @returns {object} Redux action
 */
function setFilter(filter) {
  return { type: SET_FILTER, filter: filter };
}