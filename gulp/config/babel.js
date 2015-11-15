/**
 * DOCUMENTANTION
 * ----------------------------------------------------------------------------
 * The Babel docs have a good page for looking up what each option does.
 * [Babel Options]{@link http://babeljs.io/docs/usage/options/}
 */

import project from './project';

// Read the eslintrc into JSON
let config = project.getJSONConfig('.babelrc');

/**
 * Add new config options
 */
// Object.assign(config, {
//   // new properties go here
// });

export default config;
