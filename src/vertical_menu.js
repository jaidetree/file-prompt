import colors from 'chalk';
import Menu from './menu';

const MAX_COLUMN_WIDTH = 6;

/**
 * VerticalMenu
 * Represents a selection of menu options. This class shows a list of
 * horizontal main menu options in columns.
 *
 * @class VerticalMenu
 * @extends {Menu}
 */
class VerticalMenu extends Menu {

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
   * Render Column
   * Render the column.
   *
   * @method
   * @public
   * @param {string} text - Column text
   * @returns {string} Column padded string
   */
  renderColumn (text) {
    let plainText = colors.stripColor(text),
        offset = MAX_COLUMN_WIDTH - plainText.length,
        spacer = ' '.repeat(offset);

    return `${text}${spacer}`;
  }

  /**
   * Render Option
   * Render the menu option
   *
   * @method
   * @public
   * @param {object} option - The option to render
   * @returns {string} Formatted option
   */
  renderOption (option) {
    return `  ${this.renderColumn(option.id + ':')} ${option.label}\n`;
  }
}

export default VerticalMenu;
