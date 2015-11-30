import colors from 'chalk';
import fs from 'fs';
import Dispatcher from '../streams/base_dispatcher';
import GenericTransform from '../streams/generic_transform';
import MenuTransform from '../streams/menu_transform';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';
import QueriesTransform from '../streams/queries_transform';
import VerticalMenu from '../vertical_menu';
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
export default class DirectoriesPage extends Page {

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
   * Get Initial State
   * Initializes this component's state
   *
   * @method
   * @public
   * @returns {object} Initial state properties
   */
  getInitialState () {
    return {
      selected: [],
      targetDir: null
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
   * Show Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   * @returns {Stream} A transform stream
   */
  showPrompt () {
    return this.prompt.beckon(this.question)
      .pipe(new QueriesTransform())
      .pipe(new MenuTransform({
        choices: this.menu.options()
      }))
      .pipe(new GenericTransform(this.processFile.bind(this)))
      .pipe(new Dispatcher({
        store: this.props.store,
        route: this.route
      }))
      .then(this.reprompt);
  }

  /**
   * Process File
   *
   * @method
   * @public
   * @param {Stream} stream - The ongoing transformation stream
   * @param {object} transformAction - Transform action
   */
  processFile (stream, transformAction) {
    let selectedDir = null,
        data = transformAction.data,
        params = transformAction.params,
        filepath = data.value,
        stats;

    // If transform Action is not a file, just push it down.
    if (transformAction.type !== 'file') {
      stream.push(transformAction);
      return;
    }

    stats = fs.statSync(filepath);

    /**
     * If directory change the transform action so that it does not get
     * selected in the store.
     */
    if (stats.isDirectory() ) {
      selectedDir = filepath;
      transformAction.type = 'directory';
    }

    /**
     * If we have a selected dir, there is not one already and it's the
     * only value input and not from a multiple item select then we're good.
     */
    if (
      selectedDir 
      && params.queryCount === 1 
      && !this.state.targetDir
      && data.type === 'single'
    ) {
      this.state.targetDir = selectedDir;
    }

    stream.push(transformAction);
  }

  route () {
    if (this.state.targetDir) {
      this.navigate('directories', { base: this.state.targetDir });
      return true;
    }
  }

  renderMenu () {
    this.menu.setOptions(this.getFiles(this.getGlob(), this.getBasedir()));
    return this.menu.render();
  }

  renderPrompt () {
    return this.showPrompt;
  }
}
