/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var EventEmitter = require('events'),
    _http = require('http'),
    https = require('https'),
    urlmod = require('url'),
    mf2 = require('microformat-node'),
    concat = require('concat-stream');

module.exports = function(baseUrl) {
	var emitter = new EventEmitter();

	emitter.on('urlDisco', function(url) {
		var useHTTP = urlmod.parse(url).protocol === 'http:',
		    http = useHTTP ? _http : https;

		var req = http.get(url);

		req.on('error', err => emitter.emit(err));
		req.on('response', function(res) {
			// XXX handle non-2xx responses
			res.pipe(concat(function(buf) {
				mf2.get({html: buf.toString()}, function(err, data) {
					if (err) {
						emitter.emit('error', err);
						return;
					}

					data.items.forEach(node => emitter.emit('mf2Parse', url, node));
				});
			}));
		});
	});

	emitter.on('mf2Parse', function(url, node) {
		// XXX don't hardcode that it's the first node
		var type = node.type[0];
		if (type === 'h-feed') {
			emitter.emit('h-feed', url, node);
		} else if (type === 'h-entry') {
			emitter.emit('h-entry', url, node);
		}

		// XXX should we do something else if the type is unknown?
	});

	// XXX recognize infinite recursion, when the post links to itself
	emitter.on('h-feed', function(url, node) {
		node.children.forEach(function(child) {
			// XXX check that the child is an h-entry?
			// XXX don't assume the child has a URL
			var postUrl = child.properties.url;

			// XXX my original code had this and I honestly don't know why??
			if (postUrl.length === 1) {
				var resolvedUrl = urlmod.resolve(url, postUrl[0]);

				emitter.emit('urlDisco', url);
			}
		});
	});

	emitter.on('h-entry', function(url, node) {
		
	});

	emitter.emit('urlDisco', baseUrl);

	return emitter;
};
