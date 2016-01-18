import expect from 'expect';
import ChangedPage from '../src/pages/changed_page';

import fs from 'fs';
import MockStdout from './lib/mock_stdout';
import MockStdin from './lib/mock_stdin';
import MockStream from './lib/mock_stream';
import path from 'path';
import StoreFactory from './factories/store';

import { Writable } from 'stream';

let stdout = new MockStdout();

const DATA = {};

DATA.files = [
  __filename,
];

/**
 * Creates a page instance with a mock stdin, stdout, and store
 *
 * @param {array} data - Initial data for mockstdin to emit
 * @param {object} [store={}] - Store data to initialize with
 * @returns {Page} Initialized page instance
 */
function createPage (data=[], store={}) {
  return new ChangedPage({
    store: StoreFactory.create(store),
    stdin: new MockStdin(data),
    stdout,
  });
}

describe('ChangedPage', () => {
  afterEach(() => {
    stdout.flush();
    expect.restoreSpies();
  });

  describe('#createOptionsFrom()', () => {
    it('Should return array of options', () => {
      let page = createPage(),
          options = page.createOptionsFrom([
            __filename,
          ]);

      expect(options).toBeA(Array);
      expect(options.length).toBe(1);
      expect(options[0].id).toBe(1);
      expect(options[0].isSelected).toBe(false);
      expect(options[0].label).toBe('test/changed_page.js');
      expect(options[0].name).toBe(__filename);
      expect(options[0].value).toBe(__filename);
    });
  });

  describe('#getFiles()', () => {
    it('Should return an array of files', () => {
      let page = createPage(),
          files;

      files = page.getFiles('**/*');

      expect(files).toBeA(Array);
    });
  });

  describe('#route()', () => {
    it('Should navigate to index on blank responses', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'navigate');

      page.route(stream, {
        type: 'navigate',
        data: 'blank',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('index');
    });

    it('Should navigate to index when all items are selected', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'navigate');

      page.route(stream, {
        type: 'navigate',
        data: 'all',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('index');
    });

    it('Should reprompt when done', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'reprompt');

      page.route(stream, {
        type: 'done',
        data: null,
      });

      expect(spy).toHaveBeenCalled();
    });

    it('Should display error actions', () => {
      let page = createPage(),
          stream = new MockStream(),
          spy = expect.spyOn(page, 'displayError');

      page.route(stream, {
        type: 'error',
        data: 'Error was raised',
      });

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('Error was raised');
    });
  });

  describe('#showPrompt()', () => {
    it('Should show menu options when the menu has options', () => {
      let page = createPage(),
          spy = expect.spyOn(page.menu, 'options');

      spy.andReturn([__filename]);

      expect(page.showPrompt()).toBeA(Writable);
    });

    it('Should display an error when menu has no options', () => {
      let page = createPage(),
          spy = expect.spyOn(page.menu, 'options');

      spy.andReturn([]);

      page.showPrompt();
      expect(stdout.toString()).toBe('\x1b[1m\x1b[31mNo files have been changed since last git commit.\n\x1b[39m\x1b[22m');
    });
  });

  describe('#workflow()', () => {
    it('Should have query, menu, and dispatch', () => {
      let page = createPage(),
          workflow = page.workflow();

      expect(workflow.query).toExist();
      expect(workflow.menu).toExist();
      expect(workflow.dispatch).toExist();
    });
  });
});
