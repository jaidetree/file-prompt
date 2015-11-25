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
          expect(result).toBeA(Object);
          expect(result.selectedItems).toBeA(Array);
          expect(result.selectedItems.length).toBe(1);
          expect(result.selectedItems[0].id).toBe(1);
          expect(result.selectedItems[0].action).toBe('select');
          expect(result.selectedItems[0].value).toBe('directories');
        })
        .then(done, done);
    });

    it('Should find no menu items ', (done) => {
      let menu = new Menu({
        options: MENU_OPTIONS,
        stdout: new MockStdout()
      });

      menu.find('=1')
        .catch(() => {
          done();
        });
    });

    it('Should allow * to find all items if acceptMany is on', () => {
      let menu = new Menu({
        options: MENU_OPTIONS,
        acceptsMany: true
      });

      menu.find('*')
        .then((result) => {
          let selectedItems = result.selectedItems;

          expect(selectedItems).toBeA(Array);
          expect(selectedItems.length).toBe(3);
          expect(selectedItems.every((item) => item.action === 'add'));
        });
    });

    it('Should allow * to find all items if acceptMany is on to subtract', () => {
      let menu = new Menu({
        options: MENU_OPTIONS,
        acceptsMany: true,
        stdout: new MockStdout()
      });

      menu.find('-*')
        .then((result) => {
          let selectedItems = result.selectedItems;

          expect(selectedItems).toBeA(Array);
          expect(selectedItems.length).toBe(3);
          expect(selectedItems.every((item) => item.action === 'remove'));
        });
    });

    it('Should allow a range', () => {
      let menu = new Menu({
        options: MENU_OPTIONS,
        acceptsMany: true,
        stdout: new MockStdout()
      });

      menu.find('1-3')
        .then((result) => {
          let selectedItems = result.selectedItems;

          expect(selectedItems).toBeA(Array);
          expect(selectedItems.length).toBe(3);
        });
    });
    
    
  });

});
