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
});
