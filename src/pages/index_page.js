import colors from 'chalk';
import Menu from '../menu';
import Page from '../page';
import Prompt from '../prompt';

const MENU_OPTIONS = [
      {
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
      }
];

/**
 * Index Page
 * The main menu page of our CLI app
 *
 * @class IndexPage
 * @extends {Page}
 * @property {string} intro - Introduction text
 * @property {string} question - Prompt question
 */
class IndexPage extends Page {

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
  }

  getInitialState () {
    return { 
      prompt: new Prompt({
        stdin: this.props.stdin,
        stdout: this.props.stdout
      }),
      menu: new Menu({
        options: MENU_OPTIONS,
        stdin: this.props.stdin,
        stdout: this.props.stdout
      })
    };
  }

  /**
   * Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   * @returns {Promise} Returns a promise object chained to the prompt
   */
  prompt () {
    let reprompt = () => {
      this.props.stdout.write(this.renderIntro());
      this.props.stdout.write(this.renderMenu());
      this.prompt();
    };

    return this.state.prompt.beckon(this.question)
      .then(this.processInput.bind(this))
      .then((results) => {
        let item = results.selectedItems[0];

        switch (item.value) {
        case 'quit':
          this.quit();
          break;

        case 'help':
          this.showHelp();
          reprompt();
          break;

        case null:
          reprompt();
          break;

        default:
          this.navigate(item.value);
          break;
        }

        return results;
      })
      .catch((e) => {
        if (e && e.message) this.props.stdout.write((e.stack || e.message) + '\n');
        reprompt();

        return e;
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
    return this.state.menu.find(answer, (queries) => queries.slice(0, 1));
  }

  /**
   * Quit
   * Closes the app and writes a goodbye message.
   */
  quit () {
    this.props.stdout.write('Later skater!\n');
    process.exit(1);
  }

  /**
   * Show Help
   * Displays the instructions for this app
   *
   * @method
   * @public
   */
  showHelp () {
    this.props.stdout.write(colors.red.bold('HELP') + '\n');
  }

  renderIntro () {
    return colors.white.bold(this.intro) + '\n';
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }

  renderMenu () {
    return this.state.menu.render() + '\n';
  }
}

export default IndexPage;
