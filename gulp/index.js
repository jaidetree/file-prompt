/* eslint no-console: 0 */
import gulp from 'gulp';
import { colors } from 'gulp-util';
import log from 'liquidlog';

// Load all of our tasks -- in the future we might be able to make it
// more intelligent but it is intended to work this way
import './tasks';

// Just a basic task to use a test for configurations
gulp.task('air', (done) => {
  let breaths = 3,
      count = 0,
      args = require('minimist')(process.argv.slice(2)),
      timer,
      breath = () => {
        log.start('air', colors.cyan('Breating in'));

        setTimeout(() => {
          log.start('air', colors.cyan('Now breating out'));
        }, 5000);
      };

  if (args.b || args.breaths) {
    breaths = args.b || args.breaths;
    breaths -= 1;
  }

  log.task('air')
    .text(colors.green.bold('Let’s take a moment to relax shall we?'))
    .send();

  // Take an immediate breath
  breath();

  timer = setInterval(() => {
    count += 1;

    if (count > breaths) {
      clearInterval(timer);
      log.success('air', 'Good! Feel relaxed yet? b(^_~)\\m/');
      return done();
    }

    breath();
  }, 10005);
});
