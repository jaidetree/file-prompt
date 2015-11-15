// First change directory to gulp
process.chdir(__dirname);

// Require the babel hook
require('babel-core/register');
require('babel-polyfill');
require('./index');
