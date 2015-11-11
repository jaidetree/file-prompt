/**
 * Test
 * Runs our mocha tests
 *
 * @example
 * gulp clean
*/
import gulp from 'gulp';
import jest from 'gulp-jest';
import plumber from 'gulp-plumber';
import watch from 'gulp-watch';

import paths from '../config/paths';

paths.get.test = {};
paths.get.test.src = paths.to('test', '*.js');
paths.get.test.watch = [
  paths.get.js.src,
  paths.get.test.src
];

function test () {
  return gulp.src(paths.get.test.src, { read: false })
    .pipe(plumber())
    .pipe(jest({
      bail: true,
      rootDir: './'
    }));
}

gulp.task('test', () => {
  return test();
});

/**
 * Task Watch Test
 * Runs a watcher on all src js files and tests them when changed.
 */
gulp.task('watch-test', () => {
  return watch(paths.get.test.watch, () => {
    return test();
  });
});

export default paths;
