/**
 * Copyright (c) 2015, 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * Start/stop jsdom environment
 */
/* global global, document */
import jsdomLib from 'jsdom';
const jsdom = jsdomLib.jsdom;

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

  global.document = jsdom(markup || '<!doctype html><html><body></body></html>');
  global.window = document.defaultView;
  global.navigator = global.window.navigator;

  if (addGlobals) {
    Object.keys(addGlobals).forEach(function (key) {
      global.window[key] = addGlobals[key];
      globalKeys.push(key);
    });
  }

  return globalKeys;
}

/**
 * Remove globals
 */
export function domStop (globalKeys) {
  if (globalKeys) {
    globalKeys.forEach(function (key) {
      delete global.window[key];
    });
  }

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
 */
export function mockStart (patch) {
  savedItems.window.pageYOffset = global.window.pageYOffset;
  savedItems.document.querySelector = global.document.querySelector;
  savedItems.document.clientTop = global.document.documentElement.clientTop;

  global.window.pageYOffset = patch.pageYOffset;
  global.document.querySelector = patch.querySelector;
  global.document.documentElement.clientTop = patch.clientTop;
}

/**
 * restore document and window for the component under test
 */
export function mockEnd () {
  global.window.pageYOffset = savedItems.window.pageYOffset;
  global.document.querySelector = savedItems.document.querySelector;
  global.document.documentElement.clientTop = savedItems.document.clientTop;
}
