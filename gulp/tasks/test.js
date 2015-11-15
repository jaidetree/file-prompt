/**
 * Test
 * Runs our mocha tests
 *
 * @example
 * gulp clean
*/
import glob from 'glob';
import gulp from 'gulp';
import jest from 'jest-cli';
import watch from 'gulp-watch';

import project from '../config/project';

// Jest API config
// See docs [jest-cli]{@link https://github.com/facebook/jest}
const CONFIG = {
  bail: true,
  rootDir: project.paths.cwd
};

project.paths.test = {
  src: project.to('test', '*.js')
};

project.paths.test.watch = [
  project.paths.js.src,
  project.paths.test.src
];

/**
 * Reusable test function
 */
function test () {
  let files = glob.sync(project.paths.test.src, { cwd: project.paths.cwd }),
      argv = CONFIG;

  argv._ = files;

  console.log(files);

  jest.runCli(argv, project.project.cwd, () => {
    // Tests complete
  });
}

gulp.task('test', () => test());

/**
 * Task Watch Test
 * Runs a watcher on all src js files and tests them when changed.
 */
gulp.task('watch-test', () => {
  return watch(project.paths.test.watch, () => test());
});
