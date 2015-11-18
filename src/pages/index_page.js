import colors from 'chalk';
import Menu from '../menu';
import Page from '../page';
import Prompt from '../prompt';

const MENU_OPTIONS = [
      {
        id: 1,
        label: 'directories',
        key: 'd'
      },
      {
        id: 2,
        label: 'files',
        key: 'f'
      },
      {
        id: 3,
        label: 'glob',
        key: 'g'
      },
      {
        id: 4,
        label: 'changed',
        key: 'c'
      },
      {
        id: 5,
        label: 'help',
        key: 'h'
      },
      {
        id: 6,
        label: 'exit',
        key: 'q'
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

  renderIntro () {
    return colors.white.bold(this.intro) + '\n';
  }

  renderPrompt () {
    return () => {
      this.props.prompt.beckon(this.question)
        .then((answer) => {
          console.log(answer);
        });
    };
  }

  renderMenu () {
    return this.props.menu.render();
  }
}

export default IndexPage;
