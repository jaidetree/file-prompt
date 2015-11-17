import Component from './component';
import EventEmitter from 'events';

/**
 * App
 * The whole application component
 *
 * @class App
 */
class App extends Component {
  /**
   * Pages
   * A collection of pages mapped to things
   *
   * @static
   * @public
   */
  static PAGES = {

  };

  /**
   * Constructor
   * Initiates the class instance
   *
   * @constructor
   * @param {object} props - Initial props
   */
  constructor (props) {
    super(props);
  }

  getDefaultProps () {
    return {
      comlink: new EventEmitter(),
      initialPage: null
    };
  }

  getInitialState () {
    return {
      page: null,
      files: []
    };
  }

  componentWillMount () {
    this.props.comlink.on('app:navigate', this.navigate);
  }

  componentWillUnmount () {
    this.props.comlink.off('app:navigate', this.navigate);
  }

  /**
   * Navigate
   * Sets the page state to the requested page name
   *
   * @method
   * @public
   * @param {string} pageName - Name of the page to navigate to
   */
  navigate (pageName) {
    if (!App.PAGES.hasOwnProperty(pageName)) {
      throw new Error(`App: Page does not exist “${pageName}”.`);
    }

    this.setState({
      page: new App.PAGES[pageName]({
        comlink: this.props.comlink
      })
    });
  }

  /**
   * Render
   * Displays the current page and lets it do its thing
   *
   * @method
   * @public
   * @returns {string} Returns the rendered page string
   */
  render () {
    if (!this.state.page) return '';

    return this.state.page.render();
  }

  /**
   * Render Component
   * Directly renders the output of the page to console
   *
   * @method
   * @public
   */
  renderComponent () {
    super.renderComponent();
    Component.render(this);
  }
}

export default App;
