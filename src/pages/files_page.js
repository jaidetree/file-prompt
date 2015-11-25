import glob from 'glob';
import VerticalMenu from '../vertical_menu';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';
import { addFile, removeFile } from '../actions';

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
class FilesPage extends Page {

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
  }

  /**
   * Get Default Props
   * Returns the default properties for this component. Can be overridden
   * by a subclass
   *
   * @method
   * @privae
   * @returns {object} Default FilesPage props
   */
  getDefaultProps () {
    let data = super.getDefaultProps();

    Object.assign(data, {
      filter: '**/*.js'
    });

    return data;
  }

  /**
   * Get Initial State
   * Initializes this component's state
   *
   * @method
   * @public
   * @returns {object} Initial state properties
   */
  getInitialState () {
    return {
      menu: new VerticalMenu({
        canUnselect: true,
        acceptsMany: true,
        stdin: this.props.stdin,
        stdout: this.props.stdout,
        app: this.props.app
      }),
      prompt: new Prompt({
        stdin: this.props.stdin,
        stdout: this.props.stdout
      })
    };
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
    let basedir = this.props.basedir || this.select('config.basedir'),
        selectedFiles = this.select('files');

    return glob.sync(path.join(basedir, pattern), { cwd: process.cwd() })
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
   * Update Files
   * Selects or unselects files from the store
   *
   * @method
   * @public
   * @param {array} updates - Array of updates from the prompt
   */
  updateFiles (updates) {
    if (!Array.isArray(updates)) return;

    updates.forEach((update) => {
      if (update.action === "select") {
        this.dispatch(addFile(update.value));
      }
      else {
        this.dispatch(removeFile(update.value));
      }
    });
  }

  /**
   * Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   */
  prompt () {
    let reprompt = () => {
      this.props.stdout.write(this.renderMenu());
      this.prompt();
    };

    this.state.prompt.beckon(this.question)
      .then(this.processInput.bind(this))
      .then((results) => {
        let { selectedItems, queryCount } = results;

        /**
         * If the only input given is an empty response lets go back to
         * the index.
         */
        if (queryCount === 1 && selectedItems[0].value === null) {
          return this.navigate('index');
        }

        this.updateFiles(selectedItems);

        /**
         * If the only param was a single "*" add the files and navigate
         * away to the index page
         */
        if (queryCount === 1 && selectedItems[0].type === "all") {
          return this.navigate('index');
        }

        reprompt();
      })
      .catch(() => {
        reprompt();
      });
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
    return this.state.menu.find(answer);
  }

  renderMenu () {
    this.state.menu.setOptions(this.getFiles(this.props.filter));
    return this.state.menu.render();
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }
}

export default FilesPage;
