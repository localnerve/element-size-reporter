# Size Reporter
> Reports rendered size (width, height, also top) for a DOM element or group of elements.
> No dependencies.

Use in a component to report on a DOM element's size. Can use in concert with other components to calculate a region composed of multiple component's DOM elements. This is especially useful for calculating image dimensions that span multiple DOM elements in multiple components.

### Tested with React
I use this in React with a flux flow to calculate background image dimensions for calls to Cloudinary.
Use with debounce to wire-up to resize handler. A brief example of React usage exists in the [test fixtures](/src/tests/fixtures/Simple.jsx).

## API

```javascript
createSizeReporter (selector, reporter, options)
```
Returns a size reporter function that collects size information and sends it to `reporter` when executed.

### Parameters

`selector` - {String} A CSS selector that finds the DOM element to report size on.

`reporter` - {Function} The function that receives the [Size Report](#Size-Report).

`options` - {Object} See [Options](#Options).

### Size Report
A single object that contains the following properties:

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

`group` - {String} An identifier that names a group of size reporters. This allows widths, heights, and/or tops from multiple components to be combined. Size reporter tracks these groups and sends along an `accumulate` flag in the report for multiple reporting. Defaults to 'global'. If you don't care about grouping multiple DOM elements, just ignore the `accumulate` flag in the report.

`reportWidth` - {Boolean} True to have the reporter include width in the report data.

`reportHeight` - {Boolean} True to have the reporter include height in the report data.

`reportTop` - {Boolean} True to have the reporter include top in the report data.

`grow` - {Object} Options that control artificially expanding the reported sizes. Specifically, width and height are increased, top is decreased.

  `grow.width` - {Number} The nearest multiple to expand the width to.
    Example: If this is 10, then 92 gets expanded to 100, the next highest multiple of 10.

  `grow.height` - {Number} The nearest multiple to expand the height to.

  `grow.top` - {Number} The nearest multiple to expand the top to.
