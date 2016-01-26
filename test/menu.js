import Promise from 'bluebird';
import expect from 'expect';
import Menu from '../src/menu';
import MockStdout from './lib/mock_stdout';

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
        label: 'glib',
        name: 'glib',
        value: 'glib'
      }
];

/**
 * @returns {Menu} Returns a new menu instance with test options
 */
function createMenu () {
  return new Menu({ options: MENU_OPTIONS });
}

describe('Menu', () => {
  describe('#constructor()', () => {
    it('Should exist', () => {
      expect(Menu).toExist();
    });

    it('Should produce a menu instance', () => {
      expect(new Menu()).toBeA(Menu);
    });

    it('Should have the given props', () => {
      let menu = createMenu();

      expect(menu).toExist();
      expect(menu.props).toExist();
      expect(menu.props.options).toExist();
      expect(menu.props.options).toEqual(MENU_OPTIONS);
    });
  });

  describe('#filter()', () => {
    it('Should filter menu options', () => {
      let menu = createMenu(),
          results = menu.filter((item) => item.id === 1, this);

      expect(results.length).toBe(1);
      expect(results[0].value).toBe('directories');
    });
  });

  describe('#getChoiceById()', () => {
    it('Should return an option with valid id', () => {
      let menu = createMenu(),
          result = menu.getChoiceById(1);

      expect(result).toBe(MENU_OPTIONS[0]);
    });

    it('Should throw an error with invalid id', () => {
      let menu = createMenu();

      expect(() => {
        menu.getChoiceById(5);
      }).toThrow(Error);
    });
  });

  describe('#getIdByName()', () => {
    it('Should return an array with matching value', () => {
      let menu = createMenu();

      expect(menu.getIdByName('files')).toEqual([2]);
    });

    it('Should return an empty array if name matches more than 1 option', () => {
      let menu = createMenu();

      expect(menu.getIdByName('gl')).toEqual([]);
    });
  });

  describe('#hasId()', () => {
    it('Should return true when id is present', () => {
      let menu = createMenu();

      expect(menu.hasId('3')).toBe(true);
    });

    it('Should return false when id is not present', () => {
      let menu = createMenu();

      expect(menu.hasId('5')).toBe(false);
    });
  });

  describe('#ids()', () => {
    it('Should be a list of menu option ids', () => {
      let menu = createMenu();

      expect(menu.ids()).toEqual([1, 2, 3, 4]);
    });
  });

  describe('#map()', () => {
    it('Should map all options', () => {
      let menu = createMenu();

      expect(menu.map((item) => item.id)).toEqual([1, 2, 3, 4]);
    });
  });

  describe('#options()', () => {
    it('Should return the list of options', () => {
      let menu = createMenu();

      expect(menu.options()).toBe(MENU_OPTIONS);
    });
  });

  describe('#setOptions()', () => {
    it('Should update options', () => {
      let menu = new Menu();

      expect(menu.options()).toEqual([]);
      menu.setOptions(MENU_OPTIONS);
      expect(menu.options()).toEqual(MENU_OPTIONS);
    });
  });

  describe('#renderLabel', () => {
    it('Should format a label with the first letter highlighted', () => {
      let menu = new Menu();

      expect(menu.renderLabel('test')).toBe('\x1b[35m\x1b[1mt\x1b[22m\x1b[39mest');
    });
  });

  describe('#renderOption()', () => {
    it('Should format a label with a number', () => {
      let menu = createMenu();

      expect(menu.renderOption(MENU_OPTIONS[0])).toBe('  1: \x1b[35m\x1b[1md\x1b[22m\x1b[39mirectories     ');
    });
  });

  describe('#render()', () => {
    it('Should render all the options', () => {
      let menu = createMenu();

      expect(menu.render()).toBe('  1: \x1b[35m\x1b[1md\x1b[22m\x1b[39mirectories       2: \x1b[35m\x1b[1mf\x1b[22m\x1b[39miles             3: \x1b[35m\x1b[1mg\x1b[22m\x1b[39mlob              4: \x1b[35m\x1b[1mg\x1b[22m\x1b[39mlib            \n');
    });

  });

});
