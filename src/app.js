import Component from './component';
import fs from 'fs';
import minimatch from 'minimatch';
import path from 'path';
import reducers from './reducers';
import { createStore } from 'redux';
import { navigateComplete } from './actions';

/**
 * Read Dir
 * Reads the directory and filters all the matching files to the glob
 *
 * @param {string} dir - Name of the dir to read
 * @param {string} glob - Glob string to filter the files against
 * @returns {object} A hash of indexes to their imported file class
 */
function readDir (dir, glob) {
  let files = {},
      mm = new minimatch.Minimatch(glob);

  fs.readdirSync(dir)
    // Filter out the ones that don't match the glob
    .filter(mm.match, mm)
    // For each match lets append it to our files object
    .forEach((file) => {
      let name = path.basename(file, '_page.js');

      files[name] = require(path.resolve(__dirname, dir, file)).default;
    });

  return files;
}

/**
 * Select Current Page
 * Selects the current page data from the store.
 *
 * @param {object} store - Redux data store
 * @returns {object} currentPage object
 */
function selectCurrentPage (store) {
  return store.getState().currentPage;
}

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
  static PAGES = readDir(path.join(__dirname, 'pages'), '*_page.js');

  /**
   * Constructor
   * Initiates the class instance
   *
   * @constructor
   * @param {object} props - Initial props
   */
  constructor (props) {
    super(props);
    this.store = createStore(reducers, {
      config: {
        base: this.props.base
      },
      files: [],
      glob: this.props.glob,
      currentPage: {
        name: 'index',
        props: {}
      }
    });
  }

  /**
   * Get Default Props
   * Returns the default properties object for this component instance
   *
   * @method
   * @private
   * @returns {object} Default component properties
   */
  getDefaultProps () {
    return {
      base: process.cwd(),
      filter: '**/*.js',
      stdin: process.stdin,
      stdout: process.stdout
    };
  }

  getInitialState () {
    return {
      pageName: null,
      pageProps: null
    };
  }

  /**
   * Component Will Mount
   * Mounts the component
   *
   * @method
   * @private
   */
  componentWillMount () {
    let currentPage = selectCurrentPage(this.store);

    this.once('complete', () => {
      this.componentWillUnmount();
    }, this);

    this.once('error', () => {
      this.componentWillUnmount();
    }, this);

    this.setState({
      pageName: currentPage.name,
      pageProps: currentPage.props
    });
  }

  /**
   * Component Will Mount
   * Subscribes to the store for changes and updates the display when
   * the page changes.
   *
   * @method
   * @private
   */
  componentDidMount () {
    this.unsubscribe = this.store.subscribe(() => {
      let currentPage = selectCurrentPage(this.store);

      if (currentPage.is_navigating) {
        this.setState({
          pageName: currentPage.name,
          pageProps: currentPage.props
        });
        Component.display(this);
        this.store.dispatch(navigateComplete());
      }
    });
  }

  /**
   * Component Will Unmount
   * Component will be removed from display
   *
   * @method
   * @public
   */
  componentWillUnmount () {
    this.off();
    this.unsubscribe();
  }

  /**
   * Render Page
   * Returns the requested page instance
   *
   * @method
   * @public
   * @returns {string} Returns a rendered page
   */
  renderPage () {
    let props = {
      app: this,
      store: this.store,
      stdin: this.props.stdin,
      stdout: this.props.stdout
    };

    if (!App.PAGES.hasOwnProperty(this.state.pageName)) {
      throw new Error(`App: Page does not exist “${this.state.pageName}”.`);
    }

    // If we have extra props called from navigate send those in
    if (this.state.pageProps) {
      Object.assign(props, this.state.pageProps);
    }

    return new App.PAGES[this.state.pageName](props).render();
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
    return this.renderPage();
  }
}

export default App;
