/***
 * Copyright (c) 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global before, after, describe, it */
import { expect } from 'chai';
import React from 'react';
import { domStart, domStop, mockStart, mockEnd } from '../utils/testdom';
import Simple from '../fixtures/Simple';
import createSizeReporter from '../../lib';

describe('sizeReporter', () => {
  let testUtils;

  before('sizeReporter', () => {
    domStart();
    testUtils = require('react-addons-test-utils');
  });

  after('sizeReporter', () => {
    domStop();
  });

  describe('simple tests', () => {
    it('should report and have expected report items with correct types',
    (done) => {
      const Class = createSizeReporter(Simple, '.contained', (data) => {
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

      testUtils.renderIntoDocument(React.createElement(Class));
    });

    it('should render the contained component', () => {
      const Class = createSizeReporter(Simple, '.contained', () => {});
      const element = React.createElement(Class);

      const component = testUtils.renderIntoDocument(element);

      const result = testUtils.findRenderedDOMComponentWithClass(
        component, 'contained'
      );

      expect(result.textContent).to.match(/Simple Test/);
    });

    it('should accumulate if multiple reporters in same group',
    (done) => {
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

      const children = [
        createSizeReporter(Simple, '.contained', handleReport, {
          _clearTrackers: true,
          reportWidth: true
        }),
        createSizeReporter(Simple, '.contained', handleReport, {
          reportWidth: true
        })
      ].map((childClass, index) => {
        return React.createElement(childClass, { key: index });
      });

      testUtils.renderIntoDocument(React.createElement('div', {}, children));
    });

    describe('mocked tests', () => {
      const top = 202.2, right = 600, bottom = 600, left = 202.2,
        pageYOffset = 200, clientTop = 100;

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
        }
      }

      before('mocks', () => {
        mockStart({
          querySelector: mockQuerySelector,
          pageYOffset,
          clientTop
        });
      });

      after('mocks', () => {
        mockEnd();
      });

      it('should return compute values as expected', (done) => {
        const Class = createSizeReporter(Simple, '.contained', (data) => {
          expect(data.width).to.equal(Math.round(right - left));
          expect(data.height).to.equal(Math.round(bottom - top));
          expect(data.top).to.equal(Math.round(
            top + (pageYOffset - clientTop)
          ));
          expect(data.accumulate).to.equal(false);
          done();
        }, {
          _clearTrackers: true,
          reportWidth: true,
          reportHeight: true,
          reportTop: true
        });

        testUtils.renderIntoDocument(React.createElement(Class));
      });

      it('should grow width on multiple as expected', (done) => {
        const multiple = 10;

        const Class = createSizeReporter(Simple, '.contained', (data) => {
          expect(data.width).to.equal(
            Math.ceil((right - left)/multiple) * multiple
          );
          done();
        }, {
          _clearTrackers: true,
          reportWidth: true,
          grow: {
            width: multiple
          }
        });

        testUtils.renderIntoDocument(React.createElement(Class));
      });

      it('should grow top on multiple as expected', (done) => {
        const multiple = 10;

        const Class = createSizeReporter(Simple, '.contained', (data) => {
          expect(data.top).to.equal(
            Math.floor((top + (pageYOffset - clientTop))/multiple) * multiple
          );
          expect(data.top - (pageYOffset - clientTop)).to.be.below(top);
          done();
        }, {
          _clearTrackers: true,
          reportTop: true,
          grow: {
            top: multiple
          }
        });

        testUtils.renderIntoDocument(React.createElement(Class));
      });

      it('should handle missing grow option with round', (done) => {
        const Class = createSizeReporter(Simple, '.contained', (data) => {
          expect(data.width).to.equal(
            Math.round(right - left)
          );
          done();
        }, {
          _clearTrackers: true,
          reportWidth: true
        });

        testUtils.renderIntoDocument(React.createElement(Class));
      });

      it('should handle missing grow option prop without round', (done) => {
        const Class = createSizeReporter(Simple, '.contained', (data) => {
          expect(data.width).to.equal(
            Math.ceil(right - left)
          );
          done();
        }, {
          _clearTrackers: true,
          reportWidth: true,
          grow: {}
        });

        testUtils.renderIntoDocument(React.createElement(Class));
      });
    });
  });
});
