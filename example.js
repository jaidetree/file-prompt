/* eslint no-console: 0 */
import fileprompt from './lib';

fileprompt()

  /** File selection completed */
  .then((files) => {
    console.log('FILES:', files);
  })

  /** Errors ocurred */
  .catch((err) => {
    console.error(err);
  });
