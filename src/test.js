/* eslint no-console: 0 */
import fileprompt from './';

fileprompt()

  /** File selection completed */
  .then((files) => {
    console.log('FILES:', files);
  })

  /** Errors ocurred */
  .catch((err) => {
    console.log('\n');
    console.error(err.stack || err.message || err);
    console.log('\n');
  });
