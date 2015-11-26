import colors from 'chalk';
import fs from 'fs';
import VerticalMenu from '../vertical_menu';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';
import { addFile, removeFile } from '../actions';
import { Minimatch } from 'minimatch';

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
 * Directory Page
 * The files menu page of our CLI app
 *
 * @class DirectoriesPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */
class DirectoriesPage extends Page {

  question = 'Add files or enter directory';

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
    return {
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
   * Get Files
   * Returns an array of files to select
   *
   * @param {string} glob - Globstr to test the page against
   * @param {string} [dir] - Directory to look through
   * @returns {array} Array of menu options
   */
  getFiles (glob, dir) {
    let configBasedir = this.select('config.base'),
        isBaseDir = dir === configBasedir,
        selectedFiles = this.select('files'),
        files = [],
        directories = [],
        mm = new Minimatch(glob);

    files = fs.readdirSync(dir);

    files = files
      // Map to full filepath
      .map((file) => path.join(dir, file))

      // First filter files against our glob
      .filter((filepath) => {
        let stats = fs.statSync(filepath);

        // If we have a directory store it and move on as we are good
        if (stats.isDirectory()) {
          directories.push(filepath);
          return true;
        }

        return mm.match(filepath);
      })
      // Second filter files against
      .map((filepath, i) => {
        let label = path.relative(dir, filepath),
            isDirectory = directories.indexOf(filepath) > -1;

        // if file was a directory add a slash to the label
        if (isDirectory) label += '/';

        return {
          id: isBaseDir ? i + 1 : i + 2,
          name: label,
          value: filepath,
          isSelected: selectedFiles.indexOf(filepath) > -1,
          // Make dir labels bold bold
          label: isDirectory ? colors.bold(label) : label
        };
      });

    // If we nested in the baedir add an option to go back
    if (dir !== configBasedir) {
      files.unshift({
        id: 1,
        name: '..',
        value: path.resolve(dir, '..'),
        label: colors.bold('..')
      });
    }

    return files;
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

        // Returns true if navigating, if so don't reprompt :D
        if (this.processFiles(selectedItems)) {
          return results;
        }

        reprompt();
      })
      .catch((e) => {
        this.displayError(e);
        reprompt();
      });
  }

  /**
   * Process Files
   *
   * @method
   * @public
   * @param {array} selections - Selected files & folders
   * @returns {boolean} If we are navigating or not
   */
  processFiles (selections) {
    let selectedFiles = [],
        selectedDir = null;

    selections.forEach((selection) => {
      let filepath = selection.value,
          stats = fs.statSync(filepath);

      if (stats.isDirectory() && !selectedDir && selection.type !== 'all') {
        selectedDir = filepath;
      }
      else if (!stats.isDirectory()) {
        selectedFiles.push(selection);
      }

      this.updateFiles(selectedFiles);
    });

    if (selectedDir && selections.length === 1) {
      this.navigate('directories', { base: selectedDir });
      return true;
    }

    return false;
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
    this.state.menu.setOptions(this.getFiles(this.getGlob(), this.getBasedir()));
    return this.state.menu.render();
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }
}

export default DirectoriesPage;
