import glob from 'glob-all';
import Dispatcher from '../streams/dispatcher';
import DispatchTransform from '../streams/dispatch_transform';
import GenericTransform from '../streams/generic_transform';
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
 * Glob Page
 * The files menu page of our CLI app
 *
 * @class GlobPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */
export default class GlobPage extends Page {

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

  /** LIFECYCLE METHODS */

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
      files: [],
      filter: null,
    };
  }

  /**
   * Component Should Update
   * Used to determine if component should re-render when state updates
   * occur. For this component it should not.
   *
   * @method
   * @public
   * @returns {boolean} False to prevent component from re-rendering.
   */
  componentShouldUpdate () {
    return false;
  }

  /** HELPER METHODS */

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
   * @param {string} pattern - Glob string to look for
   * @returns {array} Array of menu options
   */
  getFiles (pattern) {
    let basedir = this.getBasedir();

    return glob.sync(path.join(basedir, pattern), { cwd: process.cwd() });
  }

  /**
   * Process Glob
   * Simple transformer that reads a glob string into an array of files
   *
   * @method
   * @public
   * @param {Stream} stream - Generic transform stream
   * @param {object} transformAction - Stdin input value
   * @returns {*} Returns are used for control flow in this function.
   */
  processGlob (stream, transformAction) {
    let input, files = [],
        { type, creator } = transformAction;

    if (type !== 'string' || creator !== 'prompt') {
      return stream.push(transformAction);
    }

    input = transformAction.data;

    /**
     * If the only input given is an empty response lets go back to
     * the index.
     */
    if (!input) {
      stream.end();
      this.navigate('index');
    }

    files = this.getFiles(input);

    if (!files.length) {
      return stream.pushError(`No files matched the glob string "${input}"`);
    }

    this.setState({
      filter: input,
      files,
    });
  }

  /**
   * Question
   * Returns the prompt question based on if files have been selected
   * or not
   *
   * @method
   * @public
   * @returns {string} Prompt string to ask the user
   */
  question () {
    let basedir = this.getBasedir();

    if (this.state.files.length) {
      return 'Add files';
    }

    basedir = path.relative(path.resolve(this.select('config.base'), '..'), basedir);

    return `Enter glob from ${basedir}`;
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
   * ShowPrompt
   * Beckons the prompt
   *
   * @method
   * @public
   * @returns {stream} The resulting writable dispatcher stream.
   */
  showPrompt () {
    return this.prompt.beckon(this.question())
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
    /**
     * If files have been found from the glob, then query against those
     * matching files.
     */
    if (this.state.files.length) {
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

    return {
      glob: new GenericTransform(this.processGlob.bind(this)),
      dispatch: new DispatchTransform({
        store: this.props.store,
      }),
    };
  }

  /** RENDER METHODS */

  renderMenu () {
    if (!this.state.files.length) return '';

    this.menu.setOptions(this.createOptionsFrom(this.state.files));

    return this.menu.render();
  }

  renderPrompt () {
    return this.showPrompt;
  }
}
