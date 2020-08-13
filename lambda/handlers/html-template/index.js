'use strict';
const fs = require('fs');
const path = require('path');

const aws = require('aws-sdk');
const s3 = new aws.S3({ region: 'us-east-1' });

let indexHtmlFileContent;
let webmanifestFileContent;

s3.getObject({
  Bucket: process.env.S3_BUCKET,
  Key: 'index.html'
}, function(err, data) {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(data);
    indexHtmlFileContent = data;
  }
});

s3.getObject({
  Bucket: process.env.S3_BUCKET,
  Key: 'manifest.webmanifest'
}, function(err, data) {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(data);
    webmanifestFileContent = data;
  }
});


exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const queryString = request.querystring;

  const manifestFileRequest = /manifest.webmanifest$/;
  const resourceRequest = /(\.[a-zA-Z0-9]{2,5}$)/;
  
  console.log('Query String is: ', queryString);
  
  let body;

  if (manifestFileRequest.test(request.uri)) {
    body = webmanifestFileContent;
  } else if (!resourceRequest.test(request.uri)) {
    body = indexHtmlFileContent;
  } else {
    callback(null, request);
    return;
  }

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
};
