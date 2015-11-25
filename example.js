/* eslint no-console: 0 */
var fileprompt = require('./lib').default;

fileprompt()

  /** File selection completed */
  .then((files) => {
    console.log('FILES:', files);
  })

  /** Errors ocurred */
  .catch((err) => {
    console.error(err);
  });
