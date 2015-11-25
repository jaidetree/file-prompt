export const ADD_FILE = "ADD_FILE",
      REMOVE_FILE = "REMOVE_FILE",
      NAVIGATE = "NAVIGATE",
      NAVIGATE_COMPLETE = "NAVIGATE_COMPLETE",
      SET_CONFIG = "SET_CONFIG",
      SET_FILTER = "SET_FILTER";

export function addFile (file) {
  return { type: ADD_FILE, file };
}

export function removeFile (file) {
  return { type: REMOVE_FILE, file };
}

export function navigate (name, props = {}) {
  return { type: NAVIGATE, name, props };
}

export function navigateComplete () {
  return { type: NAVIGATE_COMPLETE };
}

export function setConfig (options) {
  return { type: SET_CONFIG, options };
}

export function setFilter (filter) {
  return { type: SET_FILTER, filter };
}
