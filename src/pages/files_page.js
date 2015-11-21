import colors from 'chalk';
import glob from 'glob';
import VerticalMenu from '../vertical_menu';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';

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
 * @param {string} pattern - Glob string to look for
 * @returns {array} Array of menu options
 */
function getFiles (pattern) {
  return glob.sync(path.join(process.cwd(), pattern), { cwd: process.cwd() })
    .map((filename, i) => {
      return {
        id: i + 1,
        label: filename,
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
    return {
      filepath: 'src/*.js',
      prompt: new Prompt()
    };
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
      menu: new VerticalMenu()
    };
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
      .then((selections, unselections) => {
        return this.props.menu.select(selections, unselections);
      })
      .then((selectedItems) => {
        console.log(selectedItems);
        reprompt();
      })
      .catch((e) => {
        if (!e) return this.props.comlink.emit('app:navigate', 'index');

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
    return this.props.menu.find(answer);
  }

  renderMenu () {
    this.state.menu.props.options = getFiles(this.props.filepath);
    return this.state.menu.render();
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }
}

export default FilesPage;
