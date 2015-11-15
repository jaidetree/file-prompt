/**
 * Test
 * Runs our mocha tests
 *
 * @example
 * gulp clean
*/
import gulp from 'gulp';
import mocha from 'gulp-mocha';
import plumber from 'gulp-plumber';
import watch from 'gulp-watch';

import project from '../config/project';

let paths = {};

paths = {};
paths.src = project.to('tests', 'mocha/*.js');
paths.watch = [
  project.paths.js.src,
  paths.src
];

/**
 * Reusable test
 * @returns {stream} Resulting transform stream
 */
function test () {
  return gulp.src(paths.src, { read: false })
    .pipe(plumber())
    .pipe(mocha({
    }));
}

gulp.task('test:mocha', () => {
  return test();
});

gulp.task('test', ['test:mocha']);

/**
 * Task Watch Test
 * Runs a watcher on all src js files and tests them when changed.
 */
gulp.task('watch:test:mocha', () => {
  return watch(paths.watch, () => {
    return test();
  });
});

export default paths;
