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
  console.log(files);
  return glob.sync(path.join(__dirname, pattern), { cwd: process.cwd() })
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

  question = 'Files';

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
      menu: new VerticalMenu(),
      prompt: new Prompt()
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
    this.props.prompt.beckon(this.question)
      .then((selections, unselections) => {
        return this.props.menu.select(selections, unselections);
      })
      .then((selectedFiles) => {
        console.log(selectedFiles);
      })
      .catch((e, input) => {
        if (!input) return this.props.comlink.emit('app:navigate', 'index');
        process.stdout.write(e.stack || e.message);
        process.stdout.write('\n');
        this.prompt();
      });
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }

  renderMenu () {
    console.log(getFiles(this.props.filepath));
    this.props.menu.props.options = getFiles(this.props.filepath);
    return this.props.menu.render();
  }
}

export default FilesPage;
