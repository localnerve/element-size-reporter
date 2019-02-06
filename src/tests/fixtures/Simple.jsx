/***
 * Copyright (c) 2016 - 2019 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 *
 * React usage example and test fixture.
 */
/* global window */
import React from 'react';
import debounce from 'lodash/debounce';
import createSizeReporter from '../../lib';

let testReporter;
function reporter (data) {
  if (testReporter) {
    testReporter(data);
  }
}

export function setMockReporter (reporter) {
  testReporter = reporter;
}

export class Simple extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      action: false
    };

    this.executeAction = this.executeAction.bind(this);
  }

  /**
   * This just toggles a state bool for testing.
   * React binds this as written.
   * A conceptual placeholder for your flux flow action executor.
   * In this function, you would execute a size action.
   */
  executeAction (data) {
    reporter(data);
    this.setState({
      action: true
    }, function () {
      setTimeout(function () {
        this.setState({
          action: false
        });
      }, 2000)
    });
  }

  /**
   * Setup window resize handler and report this component size now
   */
  componentDidMount () {
    const sizeReporter = createSizeReporter('.contained', this.executeAction, {
      reportWidth: true
    });

    this.resizeHandler = debounce(sizeReporter, 100);
    window.addEventListener('resize', this.resizeHandler);

    // reportSize now.
    setTimeout(sizeReporter, 0);
  }

  /**
   * Remove the window resize handler.
   */
  componentWillUnmount () {
    window.removeEventListener('resize', this.resizeHandler);
  }

  /**
   * render and reflect if executeAction ran.
   */
  render () {
    return (
      <div className="contained" style={{width: '100%'}}>
        <span>Simple Test {this.state.action ? 'Action' : ''}</span>
      </div>
    );
  }
}
