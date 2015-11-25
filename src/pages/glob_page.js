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
 * Glob Page
 * The files menu page of our CLI app
 *
 * @class GlobPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */
class GlobPage extends Page {

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

    /**
     * If files have been found from the glob, lets
     */
    if (this.state.files.length) {
      this.state.prompt.beckon(this.question())
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
    else {
      this.state.prompt.beckon(this.question())
        .then((answer) => {
          let files = [];

          /**
           * If the only input given is an empty response lets go back to
           * the index.
           */
          if (!answer) {
            return this.navigate('index');
          }

          files = this.getFiles(answer);

          if (!files.length) throw new Error('no_glob_match');

          this.setState({
            filter: answer,
            files
          });

          reprompt();
        })
        .catch((e) => {
          switch (e.message) {
          case 'no_glob_match':
            this.props.stdout.write(colors.bold.red('No files found. Try again.\n'));
            break;
          }
          reprompt();
        });
    }
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

    basedir = path.relative(path.resolve(this.select('config.basedir'), '..'), basedir);

    return `Enter glob from ${basedir}`;
  }

  /** RENDER METHODS */

  renderMenu () {
    if (!this.state.files.length) return '';

    this.state.menu.setOptions(this.createOptionsFrom(this.state.files));

    return this.state.menu.render();
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }
}

export default GlobPage;
