import colors from 'chalk';
import Dispatcher from '../streams/dispatcher';
import DispatchTransform from '../streams/dispatch_transform';
import MenuTransform from '../streams/menu_transform';
import minimatch from 'minimatch-all';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';
import QueriesTransform from '../streams/queries_transform';
import VerticalMenu from '../vertical_menu';
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
export default class ChangedPage extends Page {

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
   * Get Initial State
   * Initializes this component's state
   *
   * @method
   * @public
   * @returns {object} Initial state properties
   */
  getInitialState () {
    return {
      files: this.getFiles(this.getGlob()),
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
        isSelected: selectedFiles.indexOf(filename) > -1,
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
        files = output.toString().split('\n');

    if (!Array.isArray(pattern)) pattern = [pattern];

    if (!files.length) return [];

    return files.map((filename) => {
      return path.resolve(filename);
    })
    .filter((filename) => {
      return minimatch(filename, pattern) && filename.indexOf(basedir) > -1;
    });
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
   * Show Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   * @returns {stream} The resulting writable dispatcher stream.
   */
  showPrompt () {
    if (this.menu.options().length === 0) {
      this.props.stdout.write(colors.bold.red('No files have been changed since last git commit.\n'));
      return this.navigate('index');
    }

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
    this.menu.setOptions(this.createOptionsFrom(this.state.files));
    return this.menu.render();
  }

  renderPrompt () {
    return this.showPrompt;
  }
}
