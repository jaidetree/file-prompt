/* eslint no-process-env: 0 */
/**
 * Test
 * Runs our mocha tests
 *
 * @example
 * gulp clean
*/
import gulp from 'gulp';
import log from 'liquidlog';
import minimist from 'minimist';
import mocha from 'gulp-mocha';
import plumber from 'gulp-plumber';
import watch from 'gulp-watch';

import project from '../config/project';

let paths = {};

paths = {};
paths.src = project.to('test', '*.js');
paths.dir = project.to('test');
paths.watch = [
  project.paths.js.src,
  paths.src,
];

/**
 * Reusable test
 *
 * @param {vinyl} [file] - A vinyl file
 * @returns {stream} Resulting transform stream
 */
function test (file) {
  let args = minimist(process.argv.slice(2)),
      src = paths.src;

  if (file) src = project.join(paths.dir, file.basename);

  return gulp.src(src, { read: false })
    .pipe(plumber())
    .pipe(mocha(args));
}

gulp.task('test:mocha', () => {
  return test();
});

gulp.task('test', ['test:mocha']);

/**
 * Task Watch Test
 * Runs a watcher on all src js files and tests them when changed.
 */
gulp.task('watch:test', () => {
  return watch(paths.watch, (file) => {
    require.cache = {};
    log.task('Cleared')
      .data(file.relative)
      .text('From cache')
      .send();

    return test(file);
  });
});

export default paths;
