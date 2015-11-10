/**
 * Lint
 * Lints our js
 */
import gulp from 'gulp';
import babel from 'gulp-babel';
import plumber from 'gulp-plumber';
import watch from 'gulp-watch';

// Other modules
import minimist from 'minimist';

// Libraries
import log from 'gutil-waterlog';
import tap from '../lib/tap';

// Config
import paths from '../config/paths';

var config = {
      presets: ['es2015']
    };

/**
 * Lint
 * Reusble function to apply various plugins to a gulp vinyl file stream.
 *
 * @param {TransformStream} stream - A gulp vinyl transform stream
 * @returns {TransformStream} The resulting stream from the transformations
 */
function build (stream) {
  return stream
    .pipe(plumber())
    .pipe(tap((file) => {
      log.start('build')
        .action('Building JS file')
        .data(paths.fromJs(file.path))
        .send();
    }))
    .pipe(babel(config))
    .pipe(gulp.dest(paths.get.js.dest))
    .pipe(tap((file) => {
      log.success('build')
        .action('Compiled JS File')
        .data(paths.from(paths.get.js.dest, file.path))
        .send();
    }));
}

/**
 * Task Watch Build
 * Runs a watcher on all src js files and builds them when changed.
 */
gulp.task('watch-build', () => {
  return watch(paths.get.js.src, (file) => {
    return build(gulp.src(file.path));
  });
});

/**
 * Task builds
 * Builds a file or all js src files
 */
gulp.task('build', () => {
  var opts = minimist(process.argv.slice(2)),
      file = opts.file || opts.f || paths.get.js.src;

  if (file !== paths.get.js.src) {
    file = paths.resolve(file);
  }

  return build(gulp.src(file));
});
