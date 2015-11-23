import colors from 'chalk';
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
 * Get Files
 * Returns an array of files to select
 *
 * @param {string} basedir - Used to get relative path of file
 * @param {string} pattern - Glob string to look for
 * @returns {array} Array of menu options
 */
function getFiles (basedir, pattern) {
  return glob.sync(path.join(basedir, pattern), { cwd: process.cwd() })
    .map((filename, i) => {
      return {
        id: i + 1,
        label: path.relative(basedir, filename),
        name: filename,
        value: filename
      };
    }) || [];
}

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
      filter: '**/*.js',
      prompt: new Prompt()
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
      selections: [],
      menu: new VerticalMenu({ 
        canUnselect: true,
        acceptsMany: true
      })
    };
  }

  updateFiles (updates) {
    if (!Array.isArray(updates)) return;

    console.log(updates);

    updates.forEach((update) => {
      if (update.action === "add") {
        this.dispatch(addFile(update.value));
      }
      else {
        this.dispatch(removeFile(update.value));
      }
    });
  }

  getBaseDir () {
    return this.props.basedir || this.select('config.basedir');
  }

  /**
   * Filter Files
   * Returns the glob pattern to filter the files to build our menu
   *
   * @method
   * @public
   * @returns {string} Glob string to filter files against
   */
  filterFiles () {
    return getFiles(this.getBaseDir(), this.props.filter, this.select('files'));
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
      process.stdout.write(this.renderMenu());
      this.prompt();
    };

    this.props.prompt.beckon(this.question)
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
      .catch((e) => {
        if (e && e.message) {
          process.stdout.write(e.stack || e.message);
          process.stdout.write('\n');
        }

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
    this.state.menu.props.options = this.filterFiles();
    return this.state.menu.render();
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }
}

export default FilesPage;
