import expect from 'expect';
import Page from '../src/page';

describe('Page', () => {
  describe('#constructor()', () => {
    it('Should exist', () => {
      expect(Page).toExist();
    });

    it('Should create an instance of Page', () => {
      expect(new Page()).toBeA(Page);
    });

    it('Should have an empty selected array in state', () => {
      expect(new Page().state.selected).toEqual([]);
    });

  });

  describe('#selectItems()', () => {
    it('Should select a single item a list of options', () => {
      let page = new Page();

      expect(page.selectItems(['one', 'two', 'three'], 0)).toEqual(['one']);
    });

    it('Should select multiple items from a list options', () => {
      let page = new Page();

      expect(page.selectItems(['one', 'two', 'three'], [0, 2])).toEqual(['one', 'three']);
    });

    it('Should throw an error ', () => {
      let page = new Page(),
          output;

      expect(() => {
        output = page.selectItems(['one', 'two', 'three'], 3);
      }).toThrow(Error, `Expected selectItems to throw an error instead found ${output}`);
    });

  });

});
