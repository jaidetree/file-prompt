import expect from 'expect';
import Query from '../src/query';

describe('Query', () => {
  describe('#constructor()', () => {
    it('Should exit', () => {
      expect(Query).toExist();
    });

    it('Should create a query instance', () => {
      expect(new Query()).toBeA(Query);
    });

    it('Should have a static create from method', () => {
      expect(Query.createFrom).toBeA('function');
    });
  });

  describe('#createFrom()', () => {
    it('Should produce a bunch of queries from a single string', () => {
      let queries = Query.createFrom('1 2,3');

      expect(queries).toBeA('array');
      expect(queries.length).toBe(3);
      expect(queries[0]).toBeA(Query);
    });

    it('Should handle range', () => {
      let queries = Query.createFrom('1-3 -4-6 56-934 43-24');

      expect(queries).toBeA('array');
      expect(queries.length).toBe(4);
      expect(queries.join('\n').split('\n')).toEqual([
        '1-3',
        '-4-6',
        '56-934',
        '43-24',
      ]);
    });

    it('Should handle multiple strings', () => {
      let queries = Query.createFrom('file/path/1 file/path/2');

      expect(queries).toBeA('array');
      expect(queries.length).toBe(2);
    });
  });

  describe('#extractNumbers()', () => {
    it('Should return an array of numbers', () => {
      let numbers = Query.extractNumbers('-44 4 4343 44.22 8, 16 9,2 8-44');

      expect(numbers).toBeA('array');
      expect(numbers.length).toBe(11);

      numbers.forEach((number) => {
        expect(number).toBeA('number');
      });
    });

    it('Should have an instance method', () => {
      let query = new Query('5-55'),
          numbers = query.extractNumbers();

      expect(numbers).toBeA('array');
      expect(numbers.length).toBe(2);
      expect(numbers).toEqual([5, 55]);
    });
  });

  describe('is()', () => {
    it('Should return when the query matches', () => {
      let query = new Query('Hello world');

      expect(query.is('Hello world')).toBe(true);
    });

    it('Should fail when the query does not match', () => {
      let query = new Query('Hello world');

      expect(query.is('I do not match')).toBe(false);
    });
  });

  describe('#isInteger()', () => {
    it('Should return true when query is an integer', () => {
      let query = new Query('5');

      expect(query.isInteger()).toBe(true);
    });

    it('Should return false when query is not an integer', () => {
      let query = new Query('red');

      expect(query.isInteger()).toBe(false);
    });

    it('Should return false when query is =2', () => {
      let query = new Query('=2');

      expect(query.isInteger()).toBe(false);
    });
  });

  describe('#isRange()', () => {
    it('Should return true if query is in a range format n-n', () => {
      let query = new Query('5-24');

      expect(query.isRange()).toBe(true);
    });

    it('Should return false if query is not in a range format n-n', () => {
      let query = new Query('5,9, -532');

      expect(query.isRange()).toBe(false);
    });

    it('Should return false if query is in range format with --', () => {
      let query = new Query('5--9');

      expect(query.isRange()).toBe(false);
    });
  });

  describe('#isStartOf()', () => {
    it('Should return true when the query starts with given string', () => {
      let query = new Query('red fish');

      expect(query.isStartOf('red fish vanish')).toBe(true);
    });

    it('Should return false when the query does not start with given string', () => {
      let query = new Query('red fish');

      expect(query.isStartOf('blue fish never vanish')).toBe(false);
    });
  });

  describe('#isValid()', () => {
    it('Should be a valid query string if non-empty or falsey value', () => {
      let query = new Query('22skidoo');

      expect(query.isValid()).toBe(true);
    });

    it('Should return false if query is falsey', () => {
      let query = new Query('');

      expect(query.isValid()).toBe(false);
    });

    it('Should return false if query is null', () => {
      let query = new Query(null);

      expect(query.rawQueryString).toBe(null);
      expect(query.query).toBe(null);
      expect(query.isValid()).toBe(false);
    });

    it('Should return false if query is undefined', () => {
      let query = new Query();

      expect(query.rawQueryString).toBeA('undefined');
      expect(query.query).toBe(null);
      expect(query.isValid()).toBe(false);
    });
  });

  describe('#parse()', () => {
    it('Should return an object', () => {
      let data = new Query('red').parse();

      expect(data).toBeA('object');
      expect(data.type).toBe('string');
      expect(data.query).toBe('red');
      expect(data.value).toBe('red');
    });

    it('Should return an id', () => {
      let data = new Query('5').parse();

      expect(data.type).toBe('id');
      expect(data.query).toBe('5');
      expect(data.value).toBe(5);
    });

    it('Should return a range', () => {
      let data = new Query('5-94').parse();

      expect(data.type).toBe('range');
      expect(data.query).toBe('5-94');
      expect(data.value).toBeA('object');
      expect(data.value.min).toBe(5);
      expect(data.value.max).toBe(94);
    });

    it('Should parse subtractions for ids', () => {
      let data = new Query('-5').parse();

      expect(data.type).toBe('id');
      expect(data.action).toBe('unselect');
      expect(data.value).toBe(5);
      expect(data.query).toBe('-5');
    });

    it('Should parse subtractions for ranges', () => {
      let data = new Query('-5-94').parse();

      expect(data.type).toBe('range');
      expect(data.action).toBe('unselect');
      expect(data.query).toBe('-5-94');
      expect(data.value).toBeA('object');
      expect(data.value.min).toBe(5);
      expect(data.value.max).toBe(94);
    });
  });

});
