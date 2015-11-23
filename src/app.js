import Component from './component';
import fs from 'fs'; 
import minimatch from 'minimatch';
import path from 'path';
import reducers from './reducers';
import { createStore } from 'redux';

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
        basedir: this.props.basedir
      }, 
      files: [], 
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
      basedir: process.cwd()
    };
  }

  componentWillMount () {
    this.unsubscribe = this.store.subscribe(() => {
      this.forceUpdate();
      Component.display(this);
    });
  }

  componentWillUnmount () {
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
    let currentPage = this.store.getState().currentPage,
        props = {
          store: this.store
        };

    if (!App.PAGES.hasOwnProperty(currentPage.name)) {
      throw new Error(`App: Page does not exist “${currentPage.name}”.`);
    }

    // If we have extra props called from navigate send those in
    if (currentPage.props) {
      Object.assign(props, currentPage.props);
    }

    return new App.PAGES[currentPage.name](props).render();
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
