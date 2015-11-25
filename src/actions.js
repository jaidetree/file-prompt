export const ADD_FILE = "ADD_FILE",
      REMOVE_FILE = "REMOVE_FILE",
      NAVIGATE = "NAVIGATE",
      NAVIGATE_COMPLETE = "NAVIGATE_COMPLETE",
      SET_CONFIG = "SET_CONFIG",
      SET_FILTER = "SET_FILTER";

/**
 * Add File
 * Creates an add file action to the global store.
 *
 * @param {string} file - Absolute file path to add to the store
 * @returns {object} Redux action
 */
export function addFile (file) {
  return { type: ADD_FILE, file };
}

/**
 * Remove File
 * Creates a remove file action to the global store.
 *
 * @param {string} file - Absolute file path to remove from the store
 * @returns {object} Redux action
 */
export function removeFile (file) {
  return { type: REMOVE_FILE, file };
}

/**
 * Navigate
 * Creates a navigate action to the global store.
 *
 * @param {string} name - Page to navigate to
 * @param {object} props - Props to pass into the next page.
 * @returns {object} Redux action
 */
export function navigate (name, props = {}) {
  return { type: NAVIGATE, name, props };
}

/**
 * Navigate Complete
 * Creates a navigate complete action
 *
 * @returns {object} Redux action
 */
export function navigateComplete () {
  return { type: NAVIGATE_COMPLETE };
}

/**
 * Set Config
 * Updates the global config in the store
 *
 * @param {object} options - Options hash to assign onto the store
 * @returns {object} Redux action
 */
export function setConfig (options) {
  return { type: SET_CONFIG, options };
}

/**
 * Set Filter
 * Updates the global filter attribute on the store
 *
 * @param {string} filter - Filter to use by default '**\/*.js'
 * @returns {object} Redux action
 */
export function setFilter (filter) {
  return { type: SET_FILTER, filter };
}
