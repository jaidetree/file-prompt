import expect from 'expect';
import QueriesTransform from '../src/streams/queries_transform.js';
import Query from '../src/query';

describe('QueriesTransform', () => {
  describe('#getParams()', () => {
    it('Should set maxQueries to 0 by default', () => {
      let transform = new QueriesTransform(),
          params = transform.params;

      expect(params.maxQueries).toBe(0);
    });

    it('Should take maxQueries ', () => {
      let transform = new QueriesTransform({ maxQueries: 1 }),
          params = transform.params;

      expect(params.maxQueries).toBe(1);
    });

  });

  describe('#isTooManyQueries()', () => {
    it('Should return true if max queries is set and queries length exceeds it', () => {
      let transform = new QueriesTransform({ maxQueries: 1 });

      expect(transform.isTooManyQueries(['one', 'two'])).toBe(true);
    });

    it('Should return false if max queries is set and queries length does not exceed it', () => {
      let transform = new QueriesTransform({ maxQueries: 1 });

      expect(transform.isTooManyQueries(['one'])).toBe(false);
    });
  });

  describe('#transform()', () => {
    it('Should push a blank action when input is none', () => {
      let queries = new QueriesTransform(),
          spy = expect.spyOn(queries, 'pushAction'),
          action;

      queries.transform(queries.createAction({
        creator: 'prompt',
        type: 'string',
        data: '',
      }));

      expect(spy).toHaveBeenCalled();
      action = spy.calls[0].arguments[0];
      expect(action.creator).toBe('menu');
      expect(action.type).toBe('action');
      expect(action.data.operation).toBe('blank');
      expect(action.data.value).toBe(null);
      expect(action.params.queryCount).toBe(1);
    });

    it('Should push a match error', () => {
      let queries = new QueriesTransform(),
          spy = expect.spyOn(queries, 'pushError');

      queries.transform(queries.createAction({
        creator: 'prompt',
        type: 'string',
        data: {},
      }));

      expect(spy).toHaveBeenCalled();
      expect(spy.calls[0].arguments[0]).toInclude('Huh ([object Object])?');
    });

    it('Should create queries', () => {
      let queries = new QueriesTransform(),
          spy = expect.spyOn(queries, 'push'),
          action;

      queries.transform(queries.createAction({
        creator: 'prompt',
        type: 'string',
        data: '1',
      }));

      expect(spy).toHaveBeenCalled();
      action = spy.calls[0].arguments[0];

      expect(action.creator).toBe('queries');
      expect(action.type).toBe('query');
      expect(action.data).toBeA(Query);
      expect(action.params.queryCount).toBe(1);
    });

    it('Should error when there is an exceeded query limit', () => {
      let queries = new QueriesTransform({ maxQueries: 2 }),
          spy = expect.spyOn(queries, 'pushError');

      queries.transform(queries.createAction({
        creator: 'prompt',
        type: 'string',
        data: '1 2 3',
      }));

      expect(spy).toHaveBeenCalled();
      expect(spy.calls[0].arguments[0]).toBe('Huh (1 2 3)?');
    });
  });
});
