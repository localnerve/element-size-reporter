/**
 * Copyright (c) 2016 - 2019 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Start/stop jsdom environment
 */
/* global global, document */
import { JSDOM } from 'jsdom';

/**
 * Wrap the JSDOM api.
 *
 * @param {String} markup - The markup to init JSDOM with.
 * @param {Object} options - The options to init JSDOM with.
 * @returns {Object} window, document, and navigator as { win, doc, nav }.
 */
function createJSDOM (markup, options) {
  const dom = new JSDOM(markup, options);
  return {
    win: dom.window,
    doc: dom.window.document,
    nav: dom.window.navigator
  };
}

/**
 * Shim document, window, and navigator with jsdom if not defined.
 * Init document with markup if specified.
 * Add globals if specified.
 */
export function domStart (markup, addGlobals) {
  if (typeof document !== 'undefined') {
    return;
  }

  const globalKeys = [];

  const { win, doc, nav } = createJSDOM(
    markup || '<!doctype html><html><body></body></html>'
  );

  global.document = doc;
  global.window = win;
  global.navigator = nav;

  if (addGlobals) {
    Object.keys(addGlobals).forEach(function (key) {
      global.window[key] = addGlobals[key];
      globalKeys.push(key);
    });
  }

  return globalKeys;
}

/**
 * Remove globals, stop and delete the window.
 */
export function domStop (globalKeys) {
  if (globalKeys) {
    globalKeys.forEach(function (key) {
      delete global.window[key];
    });
  }

  global.window.close();

  delete global.document;
  delete global.window;
  delete global.navigator;
}

const savedItems = {
  window: {
  },
  document: {
  }
};

/**
 * patch document and window for the component under test
 *
 * @returns {Object} contains relevant dom properties to the calling test.
 */
export function mockStart (patch) {
  savedItems.window.pageYOffset = global.window.pageYOffset;
  savedItems.document.querySelector = global.document.querySelector;

  global.window.pageYOffset = patch.pageYOffset;
  global.document.querySelector = patch.querySelector;

  return {
    clientTop: global.document.documentElement.clientTop
  };
}

/**
 * restore document and window for the component under test
 */
export function mockEnd () {
  global.window.pageYOffset = savedItems.window.pageYOffset;
  global.document.querySelector = savedItems.document.querySelector;
}
