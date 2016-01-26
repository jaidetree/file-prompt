import expect from 'expect';
import MenuTransform from '../src/streams/menu_transform.js';
import MockStream from './lib/mock_stream';
import path from 'path';

/**
 * Creates a mock menu with basic implementation
 *
 * @param {array} choices - A simple flat list of choice strings
 * @returns {object} A mock menu instance
 */
function createMenu (choices=[]) {
  let menu = [].concat(choices.map((choice, idx) => {
    return {
      id: idx + 1,
      label: choice,
      name: choice,
      value: path.join(__dirname, choice),
    };
  }));

  /**
   * Create mock methods for the menu transform to call
   */

  menu.hasId = () => {};
  menu.ids = () => {};
  menu.getIdByName = () => {};
  menu.getChoiceById = () => {};

  return menu;
}

/**
 * Creates a mock query instance
 *
 * @param {object} data - Custom data to add to the mock query instance
 * @returns {object} Mock query instance with custom data
 */
function createQuery (data) {
  return {
    data,
    isInteger () {},
    toString () {
      return this.data.value.toString();
    },
  };
}

describe('MenuTransform', () => {
  describe('#getParams()', () => {
    it('CanUnselect should be false when manually specified', () => {
      let menu = new MenuTransform(),
          params = menu.getParams({ canUnselect: false });

      expect(params.canUnselect).toBe(false);
    });

    it('CanUnselect should be true by default', () => {
      let menu = new MenuTransform(),
          params = menu.getParams();

      expect(params.canUnselect).toBe(true);
    });
  });

  describe('#getChoiceIds()', () => {
    it('Should call menu.ids()', () => {
      let menu = new MenuTransform({
            menu: createMenu([
              'one.js',
              'two.js',
              'three.js',
            ]),
          }),
          spy = expect.spyOn(menu.menu, 'ids').andReturn([1, 2, 3]),
          ids;

      ids = menu.getChoiceIds();
      expect(spy).toHaveBeenCalled();
      expect(ids).toEqual([1, 2, 3]);
    });
  });

  describe('#isSelectOnly()', () => {
    it('Should return true by default', () => {
      let menu = new MenuTransform();

      expect(menu.isSelectOnly()).toBe(false);
    });

    it('Should return false when manually set and given an unselect action', () => {
      let menu = new MenuTransform();

      menu.params = menu.getParams({ canUnselect: false });

      expect(menu.isSelectOnly('unselect')).toBe(true);
    });
  });

  describe('#isValid()', () => {
    it('Should return true if every id is a valid choice', () => {
      let menu = new MenuTransform({
            menu: createMenu([
              'one.js',
              'two.js',
              'three.js',
            ]),
          }),
          spy = expect.spyOn(menu.menu, 'hasId').andReturn(true);

      expect(menu.isValid([1, 2, 3])).toBe(true);

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(3);
    });

    it('Should return false if at least one item is not valid', () => {
      let menu = new MenuTransform({
            menu: createMenu([
              'one.js',
              'two.js',
              'three.js',
            ]),
          }),
          spy = expect.spyOn(menu.menu, 'hasId').andCall((id) => {
            return [1, 2, 3].indexOf(id) > -1;
          });

      expect(menu.isValid([1, 2, 3, 4])).toBe(false);

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(4);
    });
  });

  it('Should return false if array is invalid', () => {
    let menu = new MenuTransform({
      menu: createMenu([
        'one.js',
        'two.js',
        'three.js',
      ]),
    });

    expect(menu.isValid([])).toBe(false);
  });

  it('Should return false if input is not an array', () => {
    let menu = new MenuTransform({
      menu: createMenu([
        'one.js',
        'two.js',
        'three.js',
      ]),
    });

    expect(menu.isValid('whatever')).toBe(false);
  });

  describe('#select()', () => {
    it('Should return an empty array when isSelectOnly is true', () => {
      let menu = new MenuTransform(),
          query = createQuery({
            type: 'single',
            action: 'unselect',
            value: __filename,
          }),
          ids = menu.select(query, { canUnselect: true });

      expect(ids).toEqual([]);
    });

    it('Should select all when input is *', () => {
      let menu = new MenuTransform(),
          query = createQuery({
            type: 'all',
            action: 'select',
            value: '*',
          }),
          spy = expect.spyOn(menu, 'getChoiceIds').andReturn([1]),
          ids = menu.select(query, { maxQueries: 0 });

      expect(spy).toHaveBeenCalled();
      expect(ids).toEqual([1]);
    });

    it('Should return [] when input is * and maxQueries > 0', () => {
      let menu = new MenuTransform(),
          query = createQuery({
            type: 'all',
            action: 'select',
            value: '*',
          }),
          ids = menu.select(query, { maxQueries: 1 });

      expect(ids).toEqual([]);
    });

    it('Should select a range when input is 1-5', () => {
      let menu = new MenuTransform(),
          query = createQuery({
            type: 'range',
            action: 'select',
            value: {
              min: 1,
              max: 3,
            },
          }),
          ids = menu.select(query, { maxQueries: 0 });

      expect(ids).toEqual([1, 2, 3]);
    });

    it('Should return [] for a range when maxQueries > 0', () => {
      let menu = new MenuTransform(),
          query = createQuery({
            type: 'range',
            action: 'select',
            value: {
              min: 1,
              max: 3,
            },
          }),
          ids = menu.select(query, { maxQueries: 1 });

      expect(ids).toEqual([]);
    });

    it('Should return [] when range input is invalid', () => {
      let menu = new MenuTransform(),
          query = createQuery({
            type: 'range',
            action: 'select',
            value: {
              min: 1,
              max: -3,
            },
          }),
          ids = menu.select(query, { maxQueries: 0 });

      expect(ids).toEqual([]);
    });

    it('Should select an id when input is a 3', () => {
      let menu = new MenuTransform(),
          query = createQuery({
            type: 'id',
            action: 'select',
            value: 3,
          }),
          spy = expect.spyOn(query, 'isInteger').andReturn(true),
          ids = menu.select(query, { maxQueries: 0 });

      expect(ids).toEqual([3]);
      expect(spy).toHaveBeenCalled();
    });

    it('Should return [] when input is not a number', () => {
      let menu = new MenuTransform(),
          query = createQuery({
            type: 'id',
            action: 'select',
            value: -1,
          }),
          spy = expect.spyOn(query, 'isInteger').andReturn(false),
          ids = menu.select(query, { maxQueries: 0 });

      expect(ids).toEqual([]);
      expect(spy).toHaveBeenCalled();
    });

    it('Should select an item if a string matches only one item', () => {
      let menu = new MenuTransform({
            menu: createMenu([
              'one.js',
              'two.js',
              'three.js',
            ]),
          }),
          query = createQuery({
            type: 'string',
            action: 'select',
            value: 'one.js',
          }),
          spy = expect.spyOn(menu.menu, 'getIdByName').andReturn([1]),
          ids = menu.select(query, { maxQueries: 0 });

      expect(ids).toEqual([1]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('one.js');
    });

    it('Should return [] if a string matches more than one item', () => {
      let menu = new MenuTransform({
            menu: createMenu([
              'one.js',
              'two.js',
              'three.js',
            ]),
          }),
          query = createQuery({
            type: 'string',
            action: 'select',
            value: 't',
          }),
          spy = expect.spyOn(menu.menu, 'getIdByName').andReturn([]),
          ids = menu.select(query, { maxQueries: 0 });

      expect(ids).toEqual([]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('t');
    });

    it('Should error if a string matches no item', () => {
      let menu = new MenuTransform({
            menu: createMenu([
              'one.js',
              'two.js',
              'three.js',
            ]),
          }),
          query = createQuery({
            type: 'string',
            action: 'select',
            value: 'test',
          }),
          spy = expect.spyOn(menu.menu, 'getIdByName').andReturn([]),
          ids = menu.select(query, { maxQueries: 0 });

      expect(ids).toEqual([]);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('test');
    });
  });

  describe('#transform()', () => {
    it('Should transform the action into a file selection', () => {
      let menu = new MenuTransform({
            menu: createMenu([
              'one.js',
              'two.js',
              'three.js',
            ]),
          }),
          query = createQuery({
            type: 'id',
            action: 'select',
            value: 1,
          }),
          stream = new MockStream(),
          action;


      expect.spyOn(query, 'isInteger').andReturn(true);
      expect.spyOn(menu.menu, 'hasId').andReturn(true);
      expect.spyOn(menu.menu, 'ids').andReturn([1, 2, 3]);
      expect.spyOn(menu.menu, 'getChoiceById').andReturn(menu.menu[0]);

      menu.pipe(stream);

      menu.write({
        type: 'query',
        creator: 'queries',
        data: query,
        params: {},
      });

      action = stream.first();

      expect(action.type).toBe('file');
      expect(action.data.value).toBe(path.join(__dirname, 'one.js'));
    });

    it('Should push an error if id does not exist', () => {
      let menu = new MenuTransform({
            menu: createMenu([
              'one.js',
              'two.js',
              'three.js',
            ]),
          }),
          query = createQuery({
            type: 'id',
            action: 'select',
            value: 4,
          }),
          stream = new MockStream(),
          action;


      expect.spyOn(query, 'isInteger').andReturn(true);
      expect.spyOn(menu.menu, 'hasId').andCall((id) => {
        return [1, 2, 3].indexOf(id) > -1;
      });
      expect.spyOn(menu.menu, 'ids').andReturn([1, 2, 3]);
      expect.spyOn(menu.menu, 'getChoiceById').andReturn(menu.menu[0]);

      menu.pipe(stream);

      menu.write({
        type: 'query',
        creator: 'queries',
        data: query,
        params: {},
      });

      action = stream.first();

      expect(action.type).toBe('error');
      expect(action.data).toInclude('Huh (4)?');
    });
  });
});
