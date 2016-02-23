import glob from 'glob-all';
import Dispatcher from '../streams/dispatcher';
import DispatchTransform from '../streams/dispatch_transform';
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
      app: this.props.app,
    });

    this.prompt = new Prompt({
      stdin: this.props.stdin,
      stdout: this.props.stdout,
    });

    this.pipeline = this.createPipeline();
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
      let prefix = '',
          suffix = globStr;

      /** Make sure negated patterns are still negated */
      if (suffix.slice(0, 1) === '!') {
        prefix = '!';
        suffix = suffix.slice(1);
      }

      return prefix + path.join(basedir, suffix);
    });

    return glob.sync(globs, { cwd: process.cwd() })
      .map((filename, i) => {
        let label = path.relative(basedir, filename);

        return {
          id: i + 1,
          name: label,
          value: path.resolve(process.cwd(), filename),
          isSelected: selectedFiles.indexOf(filename) > -1,
          label,
        };
      }) || [];
  }

  /**
   * Route
   * Routes the actions from the pipeline to navigation or error events.
   *
   * @param {stream} stream - Writable stream at the end of the pipeline
   * @param {object} action - Final action passed to router
   */
  route (stream, action) {
    switch (action.type) {
      case 'navigate':
        switch (action.data) {
          case 'blank':
            stream.end();
            this.navigate('index');
            break;

          case 'all':
            this.navigate('index');
            break;
        }
        break;

      case 'done':
        this.reprompt();
        break;

      case 'error':
        this.displayError(action.data);
        break;
    }
  }

  /**
   * Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   * @returns {stream} The resulting writable dispatcher stream.
   */
  showPrompt () {
    return this.prompt.beckon(this.question)
      .pipe(this.pipeline)
      .pipe(new Dispatcher(this.route));
  }

  /**
   * Workflow
   * Returns the steps in the pipeline to send to labeled stream splicer.
   *
   * @method
   * @public
   * @returns {object} named steps in the pipeline
   */
  workflow () {
    return {
      query: new QueriesTransform(),
      menu: new MenuTransform({
        menu: this.menu,
      }),
      dispatch: new DispatchTransform({
        store: this.props.store,
      }),
    };
  }

  renderMenu () {
    this.menu.setOptions(this.getFiles(this.getGlob()));
    return this.menu.render();
  }

  renderPrompt () {
    return this.showPrompt.bind(this);
  }
}
