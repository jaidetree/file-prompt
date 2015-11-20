import Component from './component';
import EventEmitter from 'events';
import fs from 'fs'; 
import minimatch from 'minimatch';
import path from 'path';

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
    .filter(mm.match.bind(mm))
    // For each match lets append it to our files object
    .forEach((file) => {
      let name = path.basename(file, '_page.js');

      files[name] = require(path.resolve(__dirname, dir, file)).default;
    });

  console.log(files);

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
    this.props.comlink.on('app:navigate', this.navigate.bind(this));
  }

  componentWillUnmount () {
    this.props.comlink.off('app:navigate', this.navigate.bind(this));
  }

  /**
   * Get Page
   * Returns the requested page instance
   *
   * @method
   * @public
   * @param {string} pageName - Name of the page to get
   * @param {object} [extraProps] - Other props to send to initialize with
   * @returns {Page} Returns a page subclass instance
   */
  getPage (pageName, extraProps) {
    let props = {
      comlink: this.props.comlink
    };

    if (!App.PAGES.hasOwnProperty(pageName)) {
      throw new Error(`App: Page does not exist “${pageName}”.`);
    }

    // Extend the default props with what is provided
    if (extraProps) {
      Object.assign(props, extraProps);
    }

    return new App.PAGES[pageName](props);
  }

  /**
   * Navigate
   * Sets the page state to the requested page name
   *
   * @method
   * @public
   * @param {string} pageName - Name of the page to navigate to
   * @param {object} [props] - Other props to send to initialize the page with
   */
  navigate (pageName, props) {
    this.setState({
      page: this.getPage(pageName, props)
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
