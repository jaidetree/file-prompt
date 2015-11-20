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

  /**
   * Get Default Props
   * Returns the default properties for this component. Can be overridden
   * by a subclass
   *
   * @method
   * @privae
   * @returns {object} Default IndexPage props
   */
  getDefaultProps () {
    return {
      menu: new Menu({
        options: MENU_OPTIONS
      }),
      prompt: new Prompt()
    };
  }

  /**
   * Prompt
   * Beckons the prompt
   *
   * @method
   * @public
   */
  prompt () {
    this.props.prompt.beckon(this.question)
      .then(this.processInput.bind(this))
      .then((selections) => {
        return this.props.menu.select(selections);
      })
      .then((selectedItems) => {
        let item = selectedItems[0];

        console.log(item);

        switch (item.value) {
        case 'quit':
          this.quit();
          break;

        case 'help':
          this.showHelp();
          throw new Error('restart');

        default:
          this.props.comlink.emit('app:navigate', item.value);
          break;
        }
      })
      .catch((e) => {
        if (e.message) console.log(e.message);
        process.stdout.write(this.renderIntro());
        process.stdout.write(this.renderMenu());
        this.prompt();
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
    return this.props.menu.find(answer, (queries) => queries.slice(0, 1));
  }

  /**
   * Quit
   * Closes the app and writes a goodbye message.
   */
  quit () {
    process.stdout.write('Later skater!\n');
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
    process.stdout.write(colors.red.bold('HELP') + '\n');
  }

  renderIntro () {
    return colors.white.bold(this.intro) + '\n';
  }

  renderPrompt () {
    return this.prompt.bind(this);
  }

  renderMenu () {
    return this.props.menu.render();
  }
}

export default IndexPage;
