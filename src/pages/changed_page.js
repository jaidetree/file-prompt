import VerticalMenu from '../vertical_menu';
import minimatch from 'minimatch';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';
import { addFile, removeFile } from '../actions';
import { execSync } from 'child_process';

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
 * Changed Files Page
 * The files menu page of our CLI app
 *
 * @class FilesPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */
class ChangedPage extends Page {

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
   * Get Initial State
   * Initializes this component's state
   *
   * @method
   * @public
   * @returns {object} Initial state properties
   */
  getInitialState () {
    let filter = this.props.filter || this.select('filter');

    return {
      files: this.getFiles(filter),
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
   * Create Options From
   * Takes our selected files and builds a menu options array
   *
   * @method
   * @public
   * @param {array} files - Array of filenames to make into options
   * @returns {array} Array of menu options
   */
  createOptionsFrom (files) {
    let selectedFiles = this.select('files'),
        basedir = this.getBasedir();

    return files.map((filename, i) => {
      return {
        id: i + 1,
        label: path.relative(basedir, filename),
        name: filename,
        value: filename,
        isSelected: selectedFiles.indexOf(filename) > -1
      };
    }) || [];
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
        output = execSync('git diff --name-only'),
        files = output.toString().split('\n'),
        mm = new minimatch.Minimatch(pattern);

    if (!files.length) return [];

    return files.map((filename) => {
      return path.resolve(filename);
    })
    .filter((filename) => {
      return mm.match(filename) && filename.indexOf(basedir) > -1;
    });
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
    this.state.menu.setOptions(this.createOptionsFrom(this.state.files));
    return this.state.menu.render();
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }
}

export default ChangedPage;
