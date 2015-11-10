/**
 * Clean
 * Removes the files in the build & bundle directories.
 *
 * @example
 * gulp clean
*/
import gulp from 'gulp';
import del from 'del';
import path from 'path';
import log from 'gutil-waterlog';
import paths from '../config/paths';

paths.clean = [
  paths.to(paths.get.js.dest, '**')
];

gulp.task('clean', () => {
  return paths.clean.forEach((file) => {
    var dir = path.dirname(file),
        files = [];

    files.push(file);
    files.push('!' + dir);

    log.success('clean')
      .action('Cleaned')
      .data(dir)
      .action('directory')
      .send();

    /** Delete that file */
    del(files, { force: true });
  });
});

export default paths;
