import Component from './component';
import EventEmitter from 'events';
import IndexPage from './pages/index_page';

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
    index: IndexPage
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
      initialPage: 'index'
    };
  }

  getInitialState () {
    let initialPage = this.props.initialPage,
        page = null;

    if (initialPage) {
      page = this.getPage(initialPage);
    }

    return {
      page,
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
   * Get Page
   * Returns the requested page instance
   *
   * @method
   * @public
   * @param {string} pageName - Name of the page to get
   * @returns {Page} Returns a page subclass instance
   */
  getPage (pageName) {
    if (!App.PAGES.hasOwnProperty(pageName)) {
      throw new Error(`App: Page does not exist “${pageName}”.`);
    }

    return new App.PAGES[pageName]({
      comlink: this.props.comlink
    });
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
    this.setState({
      page: this.getPage(pageName)
    });

    Component.display(this);
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
}

export default App;
