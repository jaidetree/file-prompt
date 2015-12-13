import glob from 'glob-all';
import Dispatcher from '../streams/base_dispatcher';
import MenuTransform from '../streams/menu_transform';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';
import QueriesTransform from '../streams/queries_transform';
import VerticalMenu from '../vertical_menu';

/**
 * Menu Options format
 *
 * @example
 * [
 *   {
 *     id: 1,
 *     label: 'directories',
 *     name: 'directories',
 *     value: 'directories'
 *   },
 *   // ...
 * ]
 */

/**
 * Files Page
 * The files menu page of our CLI app
 *
 * @class FilesPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */
export default class FilesPage extends Page {

  question = 'Add files';

  /**
   * Constructor
   * Initializes this page's subclass
   *
   * @constructor
   * @param {object} props - Properties to initialize the class with
   */
  constructor (props) {
    super(props);

    this.menu = new VerticalMenu({
      canUnselect: true,
      acceptsMany: true,
      stdin: this.props.stdin,
      stdout: this.props.stdout,
      app: this.props.app
    });

    this.prompt = new Prompt({
      stdin: this.props.stdin,
      stdout: this.props.stdout
    });
  }

  /**
   * Get Files
   * Returns an array of files to select
   *
   * @method
   * @public
   * @param {string} pattern - Glob pattern to filter against
   * @returns {array} Array of menu options
   */
  getFiles (pattern) {
    let basedir = this.getBasedir(),
        selectedFiles = this.select('files'),
        globs = pattern;

    // Make sure we have an array of globs
    if (!Array.isArray(globs)) globs = [globs];

    // Prepend the basedir to each glob
    globs = globs.map((globStr) => {
      return path.join(basedir, globStr);
    });

    return glob.sync(globs, { cwd: process.cwd() })
      .map((filename, i) => {
        let label = path.relative(basedir, filename);

        return {
          id: i + 1,
          name: label,
          value: filename,
          isSelected: selectedFiles.indexOf(filename) > -1,
          label
        };
      }) || [];
  }

  /**
   * Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   */
  showPrompt () {
    this.prompt.beckon(this.question)
      .pipe(new QueriesTransform())
      .pipe(new MenuTransform({
        choices: this.menu.options()
      }))
      .pipe(new Dispatcher({
        store: this.props.store
      }))
      .then(this.reprompt);
  }

  /**
   * Process Input
   * Deal with the answer from our prompt
   *
   * @method
   * @public
   * @param {string} answer - User input value
   * @returns {promise} Returns a promise to return the result
   */
  processInput (answer) {
    return this.menu.find(answer);
  }

  renderMenu () {
    this.menu.setOptions(this.getFiles(this.getGlob()));
    return this.menu.render();
  }

  renderPrompt () {
    return this.showPrompt.bind(this);
  }
}
