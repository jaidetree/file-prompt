/**
 * DOCUMENTANTION
 * ----------------------------------------------------------------------------
 * Each key in the .eslintrc corresponds to a page in the rules directory.
 * [Rules on eslint.org]{@link http://eslint.org/docs/rules/}
 *
 * The rest of the otpiosn can be found here:
 * [Eslint Options][@link http://eslint.org/docs/user-guide/configuring]
 */

import project from './project';

// Read the eslintrc into JSON
let config = project.getJSONConfig('.eslintrc');

/**
 * Add new rules to the linter
 */
Object.assign(config.rules, {});

export default config;
