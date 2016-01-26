import expect from 'expect';

import DispatchTransform from '../src/streams/dispatch_transform.js';

import MockStream from './lib/mock_stream';
import StoreFactory from './factories/store';

/**
 * Create our transform instance
 *
 * @param {object} store - Options to populate the store with
 * @returns {DispatchTransform} A dispatch transform instance
 */
function createDispatcher (store={}) {
  return new DispatchTransform({
    store: StoreFactory.create(store),
  });
}

describe('DispatchTransform', () => {
  describe('#formatError()', () => {
    it('Should color text red, bold it and add a linebreak', () => {
      let dispatcher = createDispatcher();

      expect(dispatcher.formatError('test message')).toBe('\x1b[31m\x1b[1mtest message\x1b[22m\x1b[39m\n');
    });
  });

  describe('#process()', () => {
    it('Should push a formatted error message on error actions', () => {
      let dispatcher = createDispatcher(),
          spy = expect.spyOn(dispatcher, 'pushAction');

      dispatcher.write({
        type: 'error',
        data: 'test message',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy.calls[0].arguments[0].data).toBe('\x1b[31m\x1b[1mtest message\x1b[22m\x1b[39m\n');
    });

    it('Should call updateFile when a file action is received', () => {
      let dispatcher = createDispatcher(),
          spy = expect.spyOn(dispatcher, 'updateFile'),
          data = {
            type: 'all',
            operation: 'select',
            value: __filename,
          };

      dispatcher.write({
        type: 'file',
        data,
        params: {},
      });

      expect(spy).toHaveBeenCalled();
      expect(spy.calls[0].arguments[0]).toBe(data);
    });

    it('Should produce a navigate action for any other action', () => {
      let dispatcher = createDispatcher(),
          spy = expect.spyOn(dispatcher, 'pushAction'),
          action;

      dispatcher.write({
        type: 'any',
        data: {
          value: 'index',
        },
      });

      expect(spy).toHaveBeenCalled();

      action = spy.calls[0].arguments[0];
      expect(action.type).toBe('navigate');
      expect(action.data).toBe('index');
    });

    it('Should produce a blank action if the value is null', () => {
      let dispatcher = createDispatcher(),
          spy = expect.spyOn(dispatcher, 'pushAction'),
          action;

      dispatcher.write({
        type: 'any',
        data: {
          value: null,
        },
      });

      expect(spy).toHaveBeenCalled();

      action = spy.calls[0].arguments[0];
      expect(action.type).toBe('navigate');
      expect(action.data).toBe('blank');
    });
  });

  describe('#updateFile()', () => {
    it('Should add a file to the store', () => {
      let dispatcher = createDispatcher(),
          store = dispatcher.store,
          files;

      dispatcher.updateFile({
        type: 'single',
        operation: 'select',
        value: __filename,
      }, { queryCount: 1 });

      files = store.getState().files;

      expect(files).toBeA(Array);
      expect(files.length).toBe(1);
      expect(files[0]).toBe(__filename);
    });

    it('Should remove a file from the store', () => {
      let dispatcher = createDispatcher({
            files: [__filename],
          }),
          store = dispatcher.store,
          files = store.getState().files;

      expect(files.length).toBe(1);

      dispatcher.updateFile({
        type: 'single',
        operation: 'unselect',
        value: __filename,
      }, { queryCount: 1 });

      files = store.getState().files;

      expect(files).toBeA(Array);
      expect(files.length).toBe(0);
    });

    it('Should change the end action to a navigate all', () => {
      let dispatcher = createDispatcher({
        files: [__filename],
      });

      dispatcher.updateFile({
        type: 'all',
        operation: 'select',
        value: __filename,
      }, { queryCount: 1 });

      expect(dispatcher.action.type).toBe('navigate');
      expect(dispatcher.action.data).toBe('all');
    });
  });

  describe('#_flush()', () => {
    it('Should push a done action when finished', (done) => {
      let dispatcher = createDispatcher(),
          stream = new MockStream();

      dispatcher.end({
        type: 'test',
        data: 'Hello World',
      });

      dispatcher
        .pipe(stream)
        .on('finish', () => {
          let action;

          expect(stream.output.length).toBe(3);

          action = stream.output[1];

          expect(action.type).toBe('done');
          expect(action.data).toBe(null);
          done();
        });
    });
  });

  describe('#_transform()', () => {
    it('Should process and push an action through', (done) => {
      let dispatcher = createDispatcher(),
          stream = new MockStream();

      dispatcher.end({
        type: 'test',
        data: {
          value: 'Hello World',
        },
        params: {},
      });

      dispatcher
        .pipe(stream)
        .on('finish', () => {
          let action = stream.output[0];

          expect(action.type).toBe('navigate');
          expect(action.data).toBe('Hello World');
          expect(action.creator).toBe('dispatch');
          expect(action.timestamp).toExist();
          expect(action.params).toExist();
          done();
        });
    });
  });

});
