# `crawl-mf2`

Crawl a [microformats2][] site to find canonical URLs for `h-entry`s

## Installation

    npm install crawl-mf2

## Example

Start a crawl and log canonical h-entry URLs found on `https://strugee.net/blog/`:

```js
var crawl = require('crawl-mf2');

var crawler = crawl('https://strugee.net/blog/`);

crawler.on('h-entry', function(url, mf2node) {
	console.log(url);
});
```

## API

The module exports a single function, `crawlMf2`, which takes a single argument, the base URL to crawl from.

It returns an [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter).

## Events

### `'error'`

Emitted when an error occurs. Currently this means either the [microformats2][] parser failed or an HTTP error occurred.

Note: [treated specially](https://nodejs.org/api/events.html#events_error_events) by Node.js.

### `'urlDisco'`

* `String` The URL being discovered

Emitted when a new URL is discovered, including the initial base URL.

### `'mf2Parse'`

* `String` The URL being parsed
* `Object` The parsed [microformats2][] node, returned by [`microformat-node`'s `.get()`](https://www.npmjs.com/package/microformat-node#get)

Emitted when a URL is parsed for [microformats2][] markup.

### `'h-feed'`

* `String` The URL containing the `h-feed`
* `Object` The parsed [microformats2][] node, returned by [`microformat-node`'s `.get()`](https://www.npmjs.com/package/microformat-node#get)

Emitted when an `h-feed` page is discovered.

### `'h-entry'`

* `String` The URL containing the `h-entry`
* `Object` The parsed [microformats2][] node, returned by [`microformat-node`'s `.get()`](https://www.npmjs.com/package/microformat-node#get)

Emitted when an `h-entry` page is discovered.

## License

LGPL 3.0+

## Author

AJ Jordan <alex@strugee.net>

 [microformats2]: http://microformats.org/
