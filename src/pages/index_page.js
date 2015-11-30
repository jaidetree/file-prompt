import colors from 'chalk';
import column from '../util/column';
import Dispatcher from '../streams/base_dispatcher';
import Menu from '../menu';
import MenuTransform from '../streams/menu_transform';
import Page from '../page';
import path from 'path';
import Prompt from '../prompt';
import QueriesTransform from '../streams/queries_transform';

const MENU_OPTIONS = [{
        id: 1,
        label: 'directories',
        name: 'directories',
        value: 'directories'
      },
      {
        id: 2,
        label: 'files',
        name: 'files',
        value: 'files'
      },
      {
        id: 3,
        label: 'glob',
        name: 'glob',
        value: 'glob'
      },
      {
        id: 4,
        label: 'changed',
        name: 'changed',
        value: 'changed'
      },
      {
        id: 5,
        label: 'help',
        name: 'help',
        value: 'help'
      },
      {
        id: 6,
        label: 'quit',
        name: 'quit',
        value: 'quit'
      }],
      MAX_LABEL_WIDTH = 6,
      MAX_HELP_WIDTH = 11;

/**
 * Index Page
 * The main menu page of our CLI app
 *
 * @class IndexPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */
export default class IndexPage extends Page {

  intro = '*** COMMANDS ***';
  question = 'What do you seek?';

  /**
   * Constructor
   * Initializes this page's subclass
   *
   * @constructor
   * @param {object} props - Properties to initialize the class with
   */
  constructor (props) {
    super(props);

    this.prompt = new Prompt({
      stdin: this.props.stdin,
      stdout: this.props.stdout
    });

    this.menu = new Menu({
      options: MENU_OPTIONS,
      stdin: this.props.stdin,
      stdout: this.props.stdout,
      app: this.props.app
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
    return this.menu.find(answer, (queries) => queries.slice(0, 1));
  }

  /**
   * Quit
   * Closes the app and writes a goodbye message.
   */
  quit () {
    if (this.props.app) {
      this.props.app.emit('complete', this.select('files'));
    }
    this.props.stdin.pause();
  }

  route (creator, type, data) {
    let { value } = data;

    switch (value) {
      case null:
        return false;

      case 'quit':
        this.quit();
        return true;

      case 'help':
        this.showHelp();
        return false;

      default:
        this.navigate(value);
        return true;
    }
  }

  /**
   * Show Help
   * Displays the instructions for this app
   *
   * @method
   * @public
   */
  showHelp () {
    let help = {
          directories: 'Select files & browse directories',
          files: 'Select from a list of all nested files',
          glob: 'Input a glob string then selected from matches',
          changed: 'Select files from git diff --name-only',
          help: 'Uhhh... this thing I guess...',
          quit: 'Forward files along'
        },
        text = 'HELP\n';

    for (let name in help) {
      if (help.hasOwnProperty(name)) {
        let content = help[name];

        text += `  ${column(name, MAX_HELP_WIDTH)} - ${content}\n`;
      }
    }

    this.props.stdout.write(colors.bold.red(text));
  }

  /**
   * Show Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   * @returns {Promise} Returns a promise object chained to the prompt
   */
  showPrompt () {
    let to = this.pipeTo;

    return this.prompt.beckon(this.question)
      .pipe(to(new QueriesTransform({
        maxQueries: 1
      })))
      .pipe(to(new MenuTransform({
        choices: this.menu.options(),
        canUnselect: false
      })))
      .pipe(to(new Dispatcher({
        store: this.props.store,
        route: this.route
      })))
      .then(this.reprompt);
  }

  /**
   * Render Intro
   * Displays the list of files if any are selected
   *
   * @method
   * @public
   * @returns {string} Intro text to display
   */
  renderIntro () {
    let text = '',
        files = this.select('files'),
        basedir = this.select('config.base');

    // Build our list of files
    if (files.length) {
      text += '\n';

      files.forEach((file, i) => {
        let relative = path.relative(basedir, file),
            label = `${i + 1}: `;

        label = column(label, MAX_LABEL_WIDTH);

        // 1: src/path/to/file.js
        text += `${label} ${relative}\n`;
      });

      text += '\n';
    }

    text += colors.white.bold(this.intro) + '\n';

    return text;
  }

  renderPrompt () {
    return this.showPrompt;
  }

  renderMenu () {
    return this.menu.render() + '\n';
  }
}
