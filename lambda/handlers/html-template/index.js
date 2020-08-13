'use strict';
const fs = require('fs');
const path = require('path');

exports.handler = (event, context, callback) => {
	const request = event.Records[0].cf.request;

	let filePath = '';

	if (request.uri == '/index.html' || request.uri == '/') {
        filePath = path.join(__dirname, 'index.html');
	} else if (request.uri == '/manifest.webmanifest') {
		filePath = path.join(__dirname, 'manifest.webmanifest');
	} else {
		// do not process
		callback(null, request);
		return;
	}

	fs.readFile(filePath, {encoding: 'utf-8'}, function(err,body){
		if (!err) {
			/*
			* Generate HTTP OK response using 200 status code with HTML body.
			*/
			const response = {
				status: '200',
				statusDescription: 'OK',
				headers: {
					'cache-control': [{
						key: 'Cache-Control',
						value: 'max-age=31536000'
					}],
					'content-type': [{
						key: 'Content-Type',
						value: 'text/html'
					}],
					'content-encoding': [{
						key: 'Content-Encoding',
						value: 'UTF-8'
					}],
					'strict-transport-security': [{
						key: 'Strict-Transport-Security', 
						value: 'max-age=63072000; includeSubdomains; preload'
					}], 
					'x-frame-options': [{
						key: 'X-Frame-Options', 
						value: 'DENY'
					}],
				},
				body: body,
			};

			//Return modified response
			callback(null, response);
		} else {
			console.log(err);
		}
	});
};
