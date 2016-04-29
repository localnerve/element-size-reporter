/***
 * Copyright (c) 2016 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License.
 * See the accompanying LICENSE file for terms.
 *
 * A higher order component to report rendered component sizes.
 * Reports at componentDidMount and on window resize.
 */
/* global document, window */
import React from 'react';
import debounce from 'lodash/debounce';

const __DEV__ = process.env.NODE_ENV !== 'production';
const defaultResizeWait = 100;

/***
 * A tracker contains a reporter count and a call count to determine the value
 * of the accumulate flag in the report. Each sizeReporter created within a
 * group (using the group option) updates that group's tracker.
 * This allows mulitple components to contribute to an overall size calculation.
 *
 * A count of reporters is accumulated each time the factory below is called to
 * create a size reporter.
 * When all the reporters finish reporting (and initially),
 *   callCount % reporters === 0.
 * This is used to determine if data should be accumulated, which is
 * passed along in the report data property: accumulate === true.
 * They should be accumulated by the report receiver when reporters have not all
 * reported for a given group.
 */
const trackers = Object.create(null);

/**
 * Round a number to nearest multiple according to rules.
 * Default multiple is 1.0. Supply nearest multiple in rules.grow parameter.
 *
 * Rounding rules:
 *   type === 'top' then use floor rounding.
 *   otherwise, use ceiling rounding.
 *
 * @param {Number} value - The raw value to round.
 * @param {Object} [rules] - Rounding rules. If omitted, just uses Math.round.
 * If supplied, must at least specify rules.type.
 * @param {String} [rules.type] - Can be one of 'top', 'width', or 'height'.
 * @param {Object} [rules.grow] - Options that control padding adjustments.
 * @param {Number} [rules.grow.top] - Nearest multiple to grow to. Used if
 * matches given type parameter.
 * @param {Number} [rules.grow.width] - Nearest multiple to grow to. Used if
 * matches given type parameter.
 * @param {Number} [rules.grow.height] - Nearest multiple to grow to. Used if
 * matches given type parameter.
 * @returns {Number} The rounded value according to rules derived from type and
 * grow.
 */
function round (value, rules) {
  let unit = 1.0, roundOp = Math.round;

  if (rules) {
    roundOp = Math[rules.type === 'top' ? 'floor' : 'ceil'];
    if ('object' === typeof rules.grow) {
      unit = rules.grow[rules.type] || 1.0;
    }
  }

  return roundOp(value / unit) * unit;
}

/**
 * Factory to create a high order React component to report size changes as
 * the result of window resize events.
 *
 * @param {Object} Component - The React class the size reporter wraps.
 * @param {String} selector - The selector used to find the DOM element to
 * report on.
 * @param {Function} reporter - The function called to report size updates.
 * @param {Object} options - Options to control what gets reported.
 * @param {String} [options.group] - An arbitrary group name under which size
 * reporters are tracked. This accumulate flag in the report is determined by
 * reporters in a group. Defaults to 'global'.
 * @param {Number} [options.resizeWait] - ms to wait until reporting resize
 * update. defaults to 100ms.
 * @param {Boolean} [options.reportWidth] - True to report width.
 * @param {Boolean} [options.reportHeight] - True to report height.
 * @param {Boolean} [options.reportTop] - True to report top.
 * @param {Object} [options.grow] - Options to control size inflations.
 * @param {Number} [options.grow.top] - Nearest multiple to grow size to.
 * @param {Number} [options.grow.width] - Nearest multiple grow size to.
 * @param {Number} [options.grow.height] - Nearest multiple to grow size to.
 * @returns {Object} A SizeReporter React class that renders the given
 *`Component`, reporting on DOM element found at `selector`.
 */
export default
function createSizeReporter (Component, selector, reporter, options) {
  options = options || {};
  options.resizeWait = options.resizeWait || defaultResizeWait;
  options.group = options.group || 'global';

  if (__DEV__) {
    if (options._clearTrackers) {
      Object.keys(trackers).forEach((key) => {
        delete trackers[key];
      });
    }
  }

  if (!trackers[options.group]) {
    trackers[options.group] = {
      reporters: 0,
      callCount: 0
    };
  }

  const tracker = trackers[options.group];

  tracker.reporters++;

  /**
   * Report the size of the DOM element found at `selector`.
   * Rounding is used on clientRect to reduce the differences and optionally
   * grow the reported sizes if requested.
   */
  function reportSize () {
    let width, height, top;

    const el = document.querySelector(selector);
    const rect = el ? el.getBoundingClientRect() : {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };

    if (options.reportWidth) {
      width = round(rect.right - rect.left, {
        type: 'width',
        grow: options.grow
      });
    }

    if (options.reportTop) {
      top = round(
        rect.top + window.pageYOffset - document.documentElement.clientTop, {
          type: 'top',
          grow: options.grow
        }
      );
    }

    if (options.reportHeight) {
      height = round(rect.bottom - rect.top, {
        type: 'height',
        grow: options.grow
      });
    }

    reporter({
      width,
      height,
      top,
      accumulate: tracker.callCount % tracker.reporters !== 0
    });

    tracker.callCount++;
  }

  return React.createClass({
    /**
     * Render the wrapped component with props.
     */
    render: function () {
      return React.createElement(Component, this.props);
    },

    /**
     * Set up the resize event listener and kick off the first report.
     */
    componentDidMount: function () {
      window.addEventListener('resize', this.resizeHandler);
      // reportSize now.
      setTimeout(reportSize, 0);
    },

    /**
     * Remove the resize event listener.
     */
    componentWillUnmount: function () {
      window.removeEventListener('resize', this.resizeHandler);
    },

    resizeHandler: debounce(reportSize, options.resizeWait)
  });
}
