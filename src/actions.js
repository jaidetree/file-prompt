export const ADD_FILE = "ADD_FILE",
      REMOVE_FILE = "REMOVE_FILE",
      NAVIGATE = "NAVIGATE",
      SET_CONFIG = "SET_CONFIG";

export function addFile (file) {
  return { type: ADD_FILE, file };
}

export function removeFile (file) {
  return { type: REMOVE_FILE, file };
}

export function navigate (name, props = {}) {
  return { type: NAVIGATE, name, props };
}

export function setConfig (options) {
  return { type: SET_CONFIG, options };
}
