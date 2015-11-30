import glob from 'glob';
import Dispatcher from '../streams/base_dispatcher';
import GenericTransform from '../streams/generic_transform';
import MenuTransform from '../streams/menu_transform'; import Page from '../page';
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
      app: this.props.app
    });

    this.prompt = new Prompt({
      stdin: this.props.stdin,
      stdout: this.props.stdout
    });
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
      filter: null
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
        isSelected: selectedFiles.indexOf(filename) > -1
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
      this.navigate('index');
      stream.push(null);
    }

    files = this.getFiles(input);

    if (!files.length) {
      return stream.pushError(new Error(`No files matched the glob string "${input}"`));
    }

    this.setState({
      filter: input,
      files
    });

    stream.push(null);
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
   * ShowPrompt
   * Beckons the prompt
   *
   * @method
   * @public
   */
  showPrompt () {
    /**
     * If files have been found from the glob, lets
     */
    if (this.state.files.length) {
      this.prompt.beckon(this.question())
        .pipe(new QueriesTransform())
        .pipe(new MenuTransform({
          choices: this.menu.options()
        }))
        .pipe(new Dispatcher({
          store: this.props.store
        }))
        .then(this.reprompt);
    }
    else {
      this.prompt.beckon(this.question())
        .pipe(new GenericTransform(this.processGlob.bind(this)))
        .pipe(new Dispatcher({
          store: this.props.store
        }))
        .on('finish', this.reprompt);
    }
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
