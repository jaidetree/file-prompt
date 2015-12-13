/**
 * Lint
 * Lints our js
 */
import gulp from 'gulp';
import babel from 'gulp-babel';
import plumber from 'gulp-plumber';
import uglify from 'gulp-uglify';
import watch from 'gulp-watch';

// Other modules
import minimist from 'minimist';

// Libraries
import log from 'liquidlog';
import tap from '../lib/tap';

// Config
import project from '../config/project';
import babelConfig from '../config/babel';

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
        .data(project.fromJsTo(file.path))
        .send();
    }))
    .pipe(babel(babelConfig))
    .pipe(uglify())
    .pipe(gulp.dest(project.paths.js.dest))
    .pipe(tap((file) => {
      log.success('build')
        .action('Compiled JS File')
        .data(project.from(project.paths.js.dest, file.path))
        .send();
    }));
}

/**
 * Task Watch Build
 * Runs a watcher on all src js files and builds them when changed.
 */
gulp.task('watch-build', () => {
  return watch(['!src/test.js', project.paths.js.src], (file) => {
    return build(gulp.src(file.path));
  });
});

/**
 * Task builds
 * Builds a file or all js src files
 */
gulp.task('build', () => {
  var opts = minimist(process.argv.slice(2)),
      file = opts.file || opts.f || ['!../src/test.js', project.paths.js.src];

  if (opts.file || opts.f) {
    file = project.resolve(file);
  }

  return build(gulp.src(file));
});
