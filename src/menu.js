import colors from 'chalk';
import column from './util/column';
import Component from './component';
import Promise from 'bluebird';
import Query from './query';
import stripAnsi from 'strip-ansi';
import { MatchError } from './errors';

const ITEMS_PER_ROW = 4,
      MAX_COLUMN_LENGTH = 20;

/**
 * Menu
 * Represents a selection of menu options. This class shows a list of
 * horizontal main menu options in columns.
 *
 * @class Menu
 * @extends {Component}
 */
export default class Menu extends Component {

  /**
   * Constructor
   * Initializes the menu component
   *
   * @constructor
   * @param {object} props - Initial component properties
   */
  constructor (props) {
    super(props);
  }

  /**
   * Get Default Props
   * Returns get default props
   *
   * @method
   * @public
   * @returns {object} Default properties for the menu instance
   */
  getDefaultProps () {
    return {
      options: [],
      stdout: process.stdout,
      stdin: process.stdin
    };
  }

  getInitialState () {
    return {
      options: this.props.options || []
    };
  }

  /** HELPER METHODS */

  /**
   * Options
   * Returns the array of options
   *
   * @method
   * @public
   * @returns {array} Array of menu options
   */
  options () {
    return this.state.options;
  }

  /**
   * Set Options
   * Update this component's options collection
   *
   * @method
   * @public
   * @param {object} options - New options to display & filter
   */
  setOptions (options) {
    this.setState({ options });
  }

  /** RENDER METHODS */

  /**
   * Render Label
   * Formats the label for horizontal menus
   *
   * @method
   * @public
   * @param {string} label - Label to format
   * @returns {string} Formatted label
   */
  renderLabel (label) {
    return `${colors.magenta.bold(label.slice(0, 1))}${label.slice(1)}`;
  }

  /**
   * Render Option
   * Render the menu option
   *
   * @method
   * @public
   * @param {object} option - The option to render
   * @param {int} i - Index to test for things with
   * @returns {string} Formatted option
   */
  renderOption (option, i) {
    let isLastInRow = (i + 1) % ITEMS_PER_ROW === 0,
        text = `  ${option.id}: ${this.renderLabel(option.label)}`;

    text = column(text, MAX_COLUMN_LENGTH);

    return `${text} ${isLastInRow ? '\n' : ''}`;
  }

  /**
   * Render
   *
   * @returns {string} All the menu options
   */
  render () {
    return this.state.options.map(this.renderOption, this).join('');
  }
}
