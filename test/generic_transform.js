import expect from 'expect';
import GenericTransform from '../src/streams/generic_transform.js';
import MockStream from './lib/mock_stream';

describe('GenericTransform', () => {
  describe('#constructor()', () => {
    it('Should take a transformCallback', (done) => {
      let transform = new GenericTransform((stream, data) => {
        expect(stream).toBe(transform);
        expect(data).toExist();
        expect(data.message).toBe('Hello World');
        done();
        return data;
      });

      transform.write({
        message: 'Hello World',
      });
    });
  });

  describe('#pushError()', () => {
    it('Push an error down the stream', (done) => {
      let transform = new GenericTransform((stream, data) => stream.push(data)),
          stream = new MockStream();

      transform.pipe(stream);

      transform.pushError('Error message');

      stream.on('finish', () => {
        let action = stream.output[0];

        expect(action.data).toBe('Error message');
        done();
      });
    });
  });

  describe('#_transform()', () => {
    it('Push data down the stream', (done) => {
      let transform = new GenericTransform((stream, data) => stream.push(data)),
          stream = new MockStream();

      transform.pipe(stream);

      transform.end({ message: 'Hello World' });

      stream.on('finish', () => {
        let action = stream.output[0];

        expect(action.message).toBe('Hello World');
        done();
      });
    });
  });
});
