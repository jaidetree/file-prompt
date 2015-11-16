/**
 * Test
 * Runs our jest tests
 *
 * @example
 * gulp clean
*/
import glob from 'glob';
import gulp from 'gulp';
import jest from 'jest-cli';
import log from 'gutil-waterlog';
import minimist from 'minimist';
import watch from 'gulp-watch';

import project from '../config/project';

let paths = project.paths,
    args = minimist(process.argv.slice(2));

paths.jest = {
  dir: project.to('tests'),
  files: '**/*.js',

  // Jest API config
  // See docs [jest-cli]{@link https://github.com/facebook/jest}
  config: project.join('config', 'jest.json')
};

// If we have a f or file argument lets add it
if (args.f || args.file) {
  paths.jest.files = args.f || args.file;
}

// Are we in the test dir?
if (project.contains(paths.cwd, project.resolve(paths.gulp, paths.jest.dir))) {
  paths.jest.dir = project.from(paths.root, paths.cwd);
}

// Build the main path to find the test files
paths.jest.src = project.join(paths.jest.dir, paths.jest.files);

paths.jest.watch = [
  paths.js.src,
  paths.jest.src
];

/**
 * Reusable test function
 */
function test () {
  let files = [],
      config = {
        config: project.paths.jest.config,
        verbose: true,
        noStackTrace: false,
        json: true
      };

  console.log(paths.jest);

  // Read the files
  files = glob.sync(paths.jest.src, { cwd: paths.gulp });

  // Filter out library files
  config._ = files.filter((file) => {
    if (file.startsWith(project.join(paths.jest.dir, 'lib'))) {
      return false;
    }
    return true;
  });

  // Oops found now files, lets just pass it in anyway. If needed we can
  // throw an error.
  if (!config._.length) {
    config._ = [project.paths.jest.src];
  }

  log.start('TEST')
    .action('Running tests')
    .data(paths.jest.src)
    .send();

  // Found this in the jest-cli source :P
  try {
    jest.runCLI(config, project.paths.gulp, (...args) => {
    });
  }
  catch (e) {
    console.log(e);
  }
}

gulp.task('test:jest', () => {
  test();
});

/**
 * Task Watch Test
 * Runs a watcher on all src js files and tests them when changed.
 */
gulp.task('watch:test:jest', () => {
  return watch(project.paths.jest.watch, () => {
    test();
  });
});
