/* eslint no-console: 0 */
import fileprompt from './';

fileprompt({
  base: '/Users/jay/Projects/venuebook/venuebook.com/instevent/app/main/static/',
  glob: ['js/bundle/**/*.js', 'css/**/*.css', '**/*.html']
})

  /** File selection completed */
  .then((files) => {
    console.log('FILES:', files);
  })

  /** Errors ocurred */
  .catch((err) => {
    console.error(err);
  });
