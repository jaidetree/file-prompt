/* eslint quote-props: [0, "consistent-as-needed"] */
/**
 * Lint
 * Lints our js
 */
import gulp from 'gulp';
import eslint from 'gulp-eslint';
import plumber from 'gulp-plumber';
import watch from 'gulp-watch';

// Other modules
import minimist from 'minimist';

// Libraries
import log from 'liquidlog';
import tap from '../lib/tap';

// Config
import config from '../config/eslint';
import project from '../config/project';

/**
 * Lint
 * Reusble function to apply various plugins to a gulp vinyl file stream.
 *
 * @param {TransformStream} stream - A gulp vinyl transform stream
 * @returns {TransformStream} The resulting stream from the transformations
 */
function lint (stream) {
  return stream
    .pipe(plumber({
      errorHandler: false
    }))

    /** Log that we are linting the file */
    .pipe(tap((file) => {
      log.start('lint')
        .action('Linting file')
        .data(project.fromJsTo(file.path))
        .send();
    }))

    /** Lint the file */
    .pipe(eslint(config))

    /** Output the results */
    .pipe(eslint.formatEach())
    .pipe(tap((file) => {
      /** There were some errors so lets not display a success message */
      if (file.eslint && file.eslint.messages.length > 0) {
        return;
      }

      /** We made it through the linter with no errors, good job */
      log.success('lint')
        .action('Cleanly linted')
        .data(project.fromJsTo(file.path))
        .send();
    }));
}

/**
 * Task Autolint
 * Runs a watcher on all src js files and lints them when changed.
 */
gulp.task('autolint', () => {
  return watch(project.paths.js.src, (file) => {
    return lint(gulp.src(file.path));
  });
});

/**
 * Task Lint
 * Lints a file or all js src files
 */
gulp.task('lint', () => {
  var opts = minimist(process.argv.slice(2)),
      file = opts.file || opts.f || project.paths.js.src;

  if (file !== project.paths.js.src) {
    file = project.resolve(project.paths.root, file);
  }

  return lint(gulp.src(file));
});
