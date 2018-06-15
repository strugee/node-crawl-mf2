/*

Copyright 2017 AJ Jordan <alex@strugee.net>.

This file is part of lazymention.

lazymention is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

lazymention is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with lazymention. If not, see
<https://www.gnu.org/licenses/>.

*/

'use strict';

var vows = require('perjury'),
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
				},
				'it works': function(err, emitter) {
					assert.ifError(err);
					assert.isObject(emitter);
				},
				'and we listen for the `urlDisco` event': {
					topic: function(emitter) {
						emitter.on('urlDisco', this.callback);
					},
					'the event is emitted': function(err, url) {
						assert.isString(url);
						assert.equals('http://localhost:47298');
					},
				}
			}
			// XXX test more
		}
	}
}).export(module);
