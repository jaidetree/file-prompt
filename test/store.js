import expect from 'expect';
import StoreFactory from './factories/store';
import { addFile, navigate, removeFile } from '../src/actions';

describe('Store', () => {
  describe('#create()', () => {
    it('Should initialize correctly', () => {
      let store = StoreFactory.create();

      expect(store).toExist();
      expect(store.getState()).toEqual(StoreFactory.defaults);
    });
  });

  describe('#navigate()', () => {
    it('Should update the page', () => {
      let store = StoreFactory.create();

      expect(store.select('currentPage.name')).toBe('index');
      store.dispatch(navigate('files'));
      expect(store.select('currentPage.name')).toBe('files');
    });
  });

  describe('#addFile()', () => {
    it('Should append to the files array', () => {
      let store = StoreFactory.create();

      expect(store.select('files')).toBeA(Array);
      expect(store.select('files')).toEqual([]);
      store.dispatch(addFile('fake/path/to/file.js'));
      expect(store.select('files').length).toBe(1);
      expect(store.select('files')[0]).toBe('fake/path/to/file.js');
    });

    it('Each action should trigger the subscriber', () => {
      let store = StoreFactory.create(),
          spy = expect.createSpy(),
          unsubscribe = store.subscribe(spy);

      expect(store.select('files')).toBeA(Array);
      expect(store.select('files')).toEqual([]);

      store.dispatch(addFile('fake/file1.js'));
      store.dispatch(addFile('fake/file2.js'));

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(2);
      expect(store.select('files')).toEqual([
        'fake/file1.js',
        'fake/file2.js'
      ]);

      unsubscribe();
    });
  });

  describe('#removeFile()', () => {
    it('Should remove from the files array', () => {
      let store = StoreFactory.create();

      expect(store.select('files')).toBeA(Array);
      expect(store.select('files')).toEqual([]);
      store.dispatch(addFile('fake/path/to/file.js'));
      expect(store.select('files').length).toBe(1);
      expect(store.select('files')[0]).toBe('fake/path/to/file.js');
      store.dispatch(removeFile('fake/path/to/file.js'));
      expect(store.select('files').length).toBe(0);
    });

    it('Each action should trigger the subscriber', () => {
      let store = StoreFactory.create(),
          spy = expect.createSpy(),
          unsubscribe = store.subscribe(spy);

      expect(store.select('files')).toBeA(Array);
      expect(store.select('files')).toEqual([]);

      store.dispatch(addFile('fake/file1.js'));
      store.dispatch(addFile('fake/file2.js'));

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(2);
      expect(store.select('files')).toEqual([
        'fake/file1.js',
        'fake/file2.js'
      ]);

      store.dispatch(removeFile('fake/file1.js'));
      store.dispatch(removeFile('fake/file2.js'));

      expect(spy).toHaveBeenCalled();
      expect(spy.calls.length).toBe(4);
      expect(store.select('files')).toEqual([]);

      unsubscribe();
    });
  });

});

