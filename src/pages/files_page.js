import glob from 'glob';
import Dispatcher from '../streams/base_dispatcher';
import MenuTransform from '../streams/menu_transform';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';
import VerticalMenu from '../vertical_menu';
import QueriesTransform from '../streams/queries_transform';

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
      glob: '**/*.js'
    });

    return data;
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

  route (creator, action, data, params) {
    let { operation, value, type } = data;

    /**
     * If the only input given is an empty response lets go back to
     * the index.
     */
    if (params.queryCount === 1 && value === null) {
      this.navigate('index');
      return true;
    }

    /**
     * If the only param was a single "*" add the files and navigate
     * away to the index page
     */
    if (params.queryCount === 1 && type === "all" && operation === 'select') {
      this.navigate('index');
      return true;
    }
  }

  /**
   * Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   */
  showPrompt () {
    let to = this.pipeTo;

    this.prompt.beckon(this.question)
      .pipe(to(new QueriesTransform()))
      .pipe(to(new MenuTransform({
        choices: this.menu.options()
      })))
      .pipe(to(new Dispatcher({
        store: this.props.store,
        route: this.route 
      })))
      .then(() => {
        this.reprompt();
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
