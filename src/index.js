import Promise from 'bluebird';
import App from './app';

/**
 * File Prompt
 * Props for files with the given options
 *
 * @param {object} options - Initial options
 * @param {string} options.base - Base directory to search in
 * @param {string} options.filter - Glob filter for files and git diff files
 * @returns {Promise} A promise when files have been selected or rejected on
 *                    error.
 */
export default function fileprompt (options={}) {
  let app = new App(Object.assign({
    base: __dirname
  }, options));

  app.props.stdout.write('\n');
  App.mount(app);

  return new Promise((resolve, reject) => {
    app.once('complete', resolve);
    app.once('error', reject);
  });
}
