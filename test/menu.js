import expect from 'expect';
import Menu from '../src/menu';

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
      }
];

describe('Menu', () => {
  describe('#constructor()', () => {
    it('Should exist', () => {
      expect(Menu).toExist();
    });

    it('Should produce a menu instance', () => {
      expect(new Menu()).toBeA(Menu);
    });

    it('Should have the given props', () => {
      let menu = new Menu({ options: MENU_OPTIONS });

      expect(menu).toExist();
      expect(menu.props).toExist();
      expect(menu.props.options).toExist();
      expect(menu.props.options).toEqual(MENU_OPTIONS);
    });
  });

  describe('#find()', () => {
    it('Should return a promise', () => {
      let menu = new Menu({
            options: MENU_OPTIONS
          }),
          result;

      result = menu.find('1');

      expect(result).toBeA(Promise);
    });

    it('Should find the menu options', (done) => {
      let menu = new Menu({
        options: MENU_OPTIONS
      });

      menu.find('1')
        .then((result) => {
          expect(result).toBeA(Array);
          expect(result.length).toBe(1);
          expect(result[0]).toBe(1);
        })
        .then(done, done);

    });
  });

});
