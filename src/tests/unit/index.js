/***
 * Copyright (c) 2016, 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global before, beforeEach, after, afterEach, describe, it */
import { expect } from 'chai';
import React from 'react';
import { domStart, domStop, mockStart, mockEnd } from '../utils/testdom';
import { Simple, setMockReporter } from '../fixtures/Simple';
import createSizeReporter from '../../lib';

describe('sizeReporter', () => {
  let testUtils;

  before('sizeReporter', () => {
    domStart();
  });

  after('sizeReporter', () => {
    domStop();
  });

  describe('structure', () => {
    it('should report and have expected report items with correct types',
    (done) => {
      const reporter = createSizeReporter('.nothing', (data) => {
        expect(typeof data.width).to.equal('number');
        expect(typeof data.height).to.equal('number');
        expect(typeof data.top).to.equal('number');
        expect(typeof data.accumulate).to.equal('boolean');
        done();
      }, {
        reportWidth: true,
        reportHeight: true,
        reportTop: true
      });

      reporter();
    });
  });

  describe('bad args', () => {
    it('should throw if no selector supplied', () => {
      expect(function () {
        createSizeReporter('', () => {});
      }).to.throw(Error);
    });

    it('should throw if no reporter function supplied', () => {
      expect(function () {
        createSizeReporter('.nothing', 'bad');
      }).to.throw(Error);
    });
  });

  describe('react', () => {
    let testUtils;

    before('react', () => {
      testUtils = require('react-addons-test-utils');
    });

    beforeEach(() => {
      // Clear the group trackers
      createSizeReporter(null, null, {
        _clearTrackers: true
      });
    });

    afterEach(() => {
      setMockReporter(null);
    });

    it('should render and execute action', (done) => {
      const element = React.createElement(Simple);
      const component = testUtils.renderIntoDocument(element);
      const result = testUtils.findRenderedDOMComponentWithClass(
        component, 'contained'
      );

      // Render test
      expect(result.textContent).to.match(/Simple Test/);

      setTimeout(function () {
        // Action test. Executes on componentDidMount so action should've run.
        expect(result.textContent).to.match(/Action/);
        done();
      }, 0);
    });

    it('should accumulate if multiple reporters in same group', (done) => {
      const reporters = 2;
      let reportCall = 0;

      /**
       * @param {Object} data - the report data from size reporter under test.
       */
      function handleReport (data) {
        if (reportCall === 0) {
          // First time, you want to overwrite the data.
          expect(data.accumulate).to.be.false;
        } else {
          // After that, you're accumulating.
          expect(data.accumulate).to.be.true;
        }

        reportCall++;
        if (reportCall === reporters) {
          done();
        }
      }

      setMockReporter(handleReport);

      const children = [Simple, Simple].map((childClass, index) => {
        return React.createElement(childClass, { key: index });
      });

      testUtils.renderIntoDocument(React.createElement('div', {}, children));
    });
  });

  describe('mocked tests', () => {
    const top = 202.2, right = 600, bottom = 600, left = 202.2,
      pageYOffset = 200;
    let domProps;

    function mockQuerySelector () {
      return {
        getBoundingClientRect: function () {
          return {
            top,
            right,
            bottom,
            left
          };
        }
      };
    }

    before('mocks', () => {
      domProps = mockStart({
        querySelector: mockQuerySelector,
        pageYOffset
      });
    });

    after('mocks', () => {
      mockEnd();
    });

    beforeEach(() => {
      // Clear the group trackers
      createSizeReporter(null, null, {
        _clearTrackers: true
      });
    });

    it('should compute values as expected', (done) => {
      const reporter = createSizeReporter('.mock', (data) => {
        expect(data.width).to.equal(Math.round(right - left));
        expect(data.height).to.equal(Math.round(bottom - top));
        expect(data.top).to.equal(Math.round(
          top + (pageYOffset - domProps.clientTop)
        ));
        expect(data.accumulate).to.equal(false);
        done();
      }, {
        reportWidth: true,
        reportHeight: true,
        reportTop: true
      });

      reporter();
    });

    it('should grow width on multiple as expected', (done) => {
      const multiple = 10;

      const reporter = createSizeReporter('.mock', (data) => {
        expect(data.width).to.equal(
          Math.ceil((right - left)/multiple) * multiple
        );
        done();
      }, {
        reportWidth: true,
        grow: {
          width: multiple
        }
      });

      reporter();
    });

    it('should grow top on multiple as expected', (done) => {
      const multiple = 10;

      const reporter = createSizeReporter('.mock', (data) => {
        expect(data.top).to.equal(
          Math.floor((top + (pageYOffset - domProps.clientTop))/multiple) * multiple
        );
        expect(data.top - (pageYOffset - domProps.clientTop)).to.be.below(top);
        done();
      }, {
        reportTop: true,
        grow: {
          top: multiple
        }
      });

      reporter();
    });

    it('should handle missing grow option with round', (done) => {
      const reporter = createSizeReporter('.mock', (data) => {
        expect(data.width).to.equal(
          Math.round(right - left)
        );
        done();
      }, {
        reportWidth: true
      });

      reporter();
    });

    it('should handle missing grow option prop without round', (done) => {
      const reporter = createSizeReporter('.mock', (data) => {
        expect(data.width).to.equal(
          Math.ceil(right - left)
        );
        done();
      }, {
        reportWidth: true,
        grow: {}
      });

      reporter();
    });
  });
});
