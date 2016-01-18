import expect from 'expect';

import BaseTransform from '../src/streams/base_transform.js';

import MockStream from './lib/mock_stream';

describe('BaseTransform', () => {
  describe('#createAction()', () => {
    it('Should create an action object', () => {
      let transform = new BaseTransform(),
          action = transform.createAction({ type: 'test', data: 'Hello World' });

      expect(action.creator).toBe('BaseTransform');
      expect(action.type).toBe('test');
      expect(action.data).toBe('Hello World');
      expect(action.timestamp).toExist();
      expect(action.params).toExist();
    });
  });

  describe('#errorHandler()', () => {
    afterEach(() => {
      expect.restoreSpies();
    });

    it('Should print err to output and call process.exit(1)', () => {
      let transform = new BaseTransform(),
          writeSpy = expect.spyOn(process.stderr, 'write'),
          exitSpy = expect.spyOn(process, 'exit');

      transform.errorHandler({ stack: 'Hello World' });

      expect(writeSpy).toHaveBeenCalledWith('Hello World\n');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('#filterData()', () => {
    it('Should return true when every key is a match', () => {
      let transform = new BaseTransform(),
          filters = {
            type: 'test',
            data: 'Hello World',
          },
          chunk = transform.createAction({
            type: 'test',
            data: 'Hello World',
          });

      expect(transform.filterData(filters, chunk)).toBe(true);
    });

    it('Should return true when every key is a match', () => {
      let transform = new BaseTransform(),
          filters = {
            type: 'test',
            data: 'Hello World',
          },
          chunk = transform.createAction({
            type: 'other test',
            data: 'not Hello World',
          });

      expect(transform.filterData(filters, chunk)).toBe(false);
    });
  });

  describe('#matchError()', () => {
    it('Should format an error string with the suffix', () => {
      let transform = new BaseTransform(),
          spy = expect.spyOn(transform, 'pushError');

      transform.matchError('what');

      expect(spy).toHaveBeenCalledWith('Huh (what)?');
    });

    it('Should format an error string without', () => {
      let transform = new BaseTransform(),
          spy = expect.spyOn(transform, 'pushError');

      transform.matchError('');

      expect(spy).toHaveBeenCalledWith('Huh?');
    });
  });

  describe('#pushAction', () => {
    it('Should push an action down the stream', (done) => {
      let transform = new BaseTransform(),
          stream = new MockStream();


      transform.pushAction({ type: 'test', data: 'Hello World' });
      transform.end();

      transform.pipe(stream)
        .on('finish', () => {
          let action = stream.input[0];

          expect(action.type).toBe('test');
          expect(action.data).toBe('Hello World');
          expect(action.creator).toBe('BaseTransform');
          expect(action.params).toExist();
          expect(action.timestamp).toExist();

          done();
        });
    });
  });

  describe('#pushError()', () => {
    it('Should push an error action down the stream', (done) => {
      let transform = new BaseTransform(),
          stream = new MockStream();

      transform.pushError('Error message is great');
      transform.end();

      transform.pipe(stream)
        .on('finish', () => {
          let action = stream.input[0];

          expect(action.type).toBe('error');
          expect(action.data).toBe('Error message is great');
          expect(action.creator).toBe('BaseTransform');
          expect(action.params).toExist();
          expect(action.timestamp).toExist();

          done();
        });
    });
  });

  describe('#setListeners()', () => {
    it('Should add an error listener to the stream', () => {
      let transform = new BaseTransform();

      expect(transform.listeners('error').length).toBe(1);
    });
  });

  describe('#transform()', () => {
    it('Should push input down the stream', (done) => {
      let transform = new BaseTransform(),
          stream = new MockStream();

      transform.transform('This is a test');
      transform.end();

      transform.pipe(stream)
        .on('finish', () => {
          let data = stream.input[0];

          expect(data).toBe('This is a test');
          done();
        });
    });
  });

  describe('#_transform()', () => {
    it('Should use the internal method to transform data', () => {
      let transform = new BaseTransform(),
          stream = new MockStream(),
          spy = expect.spyOn(transform, '_transform');

      transform.pipe(stream);

      transform.end('Test Content');

      expect(spy).toHaveBeenCalled();
      expect(spy.calls[0].arguments[0]).toBe('Test Content');
    });

    it('Should call #transform() when filters match', () => {
      let transform = new BaseTransform(),
          stream = new MockStream(),
          spy = expect.spyOn(transform, 'transform'),
          action;

      transform.filters = {
        type: 'test',
      };

      transform.pipe(stream);
      transform.write(transform.createAction({
        type: 'test',
        data: 'Hello World',
      }));

      action = spy.calls[0].arguments[0];

      expect(action.type).toBe('test');
      expect(action.data).toBe('Hello World');
    });

    it('Should not call #transform() when filters do not match', () => {
      let transform = new BaseTransform(),
          stream = new MockStream(),
          spy = expect.spyOn(transform, 'transform');

      transform.filters = {
        type: 'test',
      };

      transform.pipe(stream);
      transform.write(transform.createAction({
        type: 'not test',
        data: 'Hello World',
      }));

      expect(spy).toNotHaveBeenCalled();
    });
  });
});
