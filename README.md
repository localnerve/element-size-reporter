# Element Size Reporter



[![npm version](https://badge.fury.io/js/element-size-reporter.svg)](http://badge.fury.io/js/element-size-reporter)
[![Build Status](https://travis-ci.org/localnerve/element-size-reporter.svg?branch=master)](https://travis-ci.org/localnerve/element-size-reporter)
[![Coverage Status](https://coveralls.io/repos/localnerve/element-size-reporter/badge.svg?branch=master)](https://coveralls.io/r/localnerve/element-size-reporter?branch=master)
[![Dependency Status](https://david-dm.org/localnerve/element-size-reporter.svg)](https://david-dm.org/localnerve/element-size-reporter)
[![devDependency Status](https://david-dm.org/localnerve/element-size-reporter/dev-status.svg)](https://david-dm.org/localnerve/element-size-reporter#info=devDependencies)

> Reports rendered size (width, height, also top) for a DOM element or group of elements.
>
> No dependencies.

Use in a component to report on a DOM element's size. Can use in concert with other components to calculate a region composed of multiple component's DOM elements. This is especially useful for calculating image dimensions that span multiple DOM elements in multiple components.

### Use with React/Flux
I use this in a React flux flow to calculate background image dimensions and position spanning multiple components and elements for calls to an image service (Cloudinary) in conjunction with [react-element-size-reporter](https://github.com/localnerve/react-element-size-reporter).

## API

```javascript
createSizeReporter (selector, reporter, options)
```
Returns a size reporter function that creates a [Size Report](#size-report) of the rendered element found for given `selector`. Sends the report to `reporter` when executed.

### Parameters

`selector` - {String} A CSS selector that finds the DOM element to report size on.

`reporter` - {Function} The function that receives the [Size Report](#size-report).

`options` - {Object} See [Options](#Options).

### Size Report
A single `object` that contains the following properties:

`width` - {Number} The width of the DOM element selected.
  Computed as the difference of the selected element bounding client rect (left from right).

`height` - {Number} The height of the DOM element selected.
  Computed as the difference of the selected element bounding client rect (top from bottom).

`top` - {Number} The top to the DOM element selected. Computed as:
```javascript
  selectedElement.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop;
```

`accumulate` - {Boolean} True if the data should be combined with previous data sent.
  Ignore this flag if you are not using grouped, multiple DOM elements.

## Options

`group` - {String} An identifier that uniquely names a group of size reporters. This allows widths, heights, and/or tops from multiple components to be accumulated. Element Size Reporter tracks these groups and sends along an `accumulate` flag in the report for multiple reporting. Defaults to 'global'. If you don't care about grouping multiple DOM elements, just ignore the `accumulate` flag in the report.

`reportWidth` - {Boolean} True to have the reporter include width in the report data.

`reportHeight` - {Boolean} True to have the reporter include height in the report data.

`reportTop` - {Boolean} True to have the reporter include top in the report data.

`grow` - {Object} Options that control the arbitrary expansion the reported sizes. Specifically, width and height are increased, top is decreased. Use to reduce/conform image requests, or just otherwise smooth or adjust the reported size.

  `grow.width` - {Number} The nearest multiple to expand the width to.
    Example: If this is 10, then 92 gets expanded to 100, the next highest multiple of 10.

  `grow.height` - {Number} The nearest multiple to expand the height to.

  `grow.top` - {Number} The nearest multiple to expand the top to.
