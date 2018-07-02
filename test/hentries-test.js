/*

Copyright 2018 AJ Jordan <alex@strugee.net>.

This file is part of node-crawl-mf2.

node-crawl-mf2 is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

node-crawl-mf2 is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with node-crawl-mf2. If not, see
<https://www.gnu.org/licenses/>.

*/

'use strict';

var vows = require('vows'),
    assert = vows.assert,
    express = require('express'),
    path = require('path');

vows.describe('h-entry canonicalization module').addBatch({
	'When we set up a server to serve posts': {
		topic: function() {
			var app = express();

			app.use(express.static(path.join(__dirname, 'data'), {
				extensions: ['html']
			}));

			app.listen(47298, this.callback);
		},
		'it works': function(err) {
			assert.ifError(err);
		},
		'and we require the module': {
			topic: function() {
				return require('../index');
			},
			'it works': function(err) {
				assert.ifError(err);
			},
			'it returns a function': function(err, crawl) {
				assert.isFunction(crawl);
			},
			'and we trigger a crawl': {
				topic: function(crawl) {
					var emitter = crawl('http://localhost:47298/h-feed-with-h-entries.html');
					emitter.on('error', this.callback);
					return emitter;
				},
				'it works': function(err, emitter) {
					assert.ifError(err);
					assert.isObject(emitter);
				},
				'and we listen for the `urlDisco` event': {
					topic: function(emitter) {
						emitter.once('urlDisco', url => this.callback(undefined, url));
					},
					'the event is emitted': function(err, url) {
						assert.isString(url);
						// XXX TODO:
						// The initial event isn't caught because listeners are called synchronously but Vows calls batches asynchronously
						assert.equal(url, 'http://localhost:47298/entry-1');
					},
				},
				'and we listen for the `mf2Parse` event': {
					topic: function(emitter) {
						emitter.on('mf2Parse', (url, node) => this.callback(undefined, url, node));
					},
					'the emitted event includes the URL': function(err, url, node) {
						assert.isString(url);
						assert.equal(url, 'http://localhost:47298/h-feed-with-h-entries.html');
					},
					'the emitted event includes the parsed mf2 h-feed object': function(err, url, node) {
						assert.isObject(node);
						assert.isArray(node.type);
						assert.isString(node.type[0]);
						assert.equal(node.type[0], 'h-feed');
					}
				},
				'and we listen for the `h-feed` event': {
					topic: function(emitter) {
						emitter.on('h-feed', (url, node) => this.callback(undefined, url, node));
					},
					'the emitted event includes the URL': function(err, url, node) {
						assert.isString(url);
						assert.equal(url, 'http://localhost:47298/h-feed-with-h-entries.html');
					},
					'the emitted event includes the parsed mf2 h-feed object': function(err, url, node) {
						assert.isObject(node);
						assert.isArray(node.type);
						assert.isString(node.type[0]);
						assert.equal(node.type[0], 'h-feed');
					}
				}
			}
			// XXX test more
		}
	}
}).export(module);
