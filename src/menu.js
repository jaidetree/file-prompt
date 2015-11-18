import colors from 'chalk';
import Component from './component';

const ITEMS_PER_ROW = 4,
      MAX_COLUMN_LENGTH = 20;

class Menu extends Component {
  constructor (props) {
    super(props);
  }

  renderOption (option, i) {
    let optionLabel = (label) => {
          return `${colors.magenta.bold(label.slice(0, 1))}${label.slice(1)}`;
        },
        isLastInRow = (i + 1) % ITEMS_PER_ROW === 0,
        column = `  ${option.id}: ${optionLabel(option.label)}`,
        spacer = ' ';

    // throw new Error(`Spacer length ${MAX_COLUMN_LENGTH} ${column.length} ${MAX_COLUMN_LENGTH - column.length} ${column}`);
    spacer = spacer.repeat(MAX_COLUMN_LENGTH - colors.stripColor(column).length);

    return `${column}${spacer}${isLastInRow ? '\n' : ''}`;
  }

  render () {
    return this.props.options.map(this.renderOption).join('');
  }
}

export default Menu;
