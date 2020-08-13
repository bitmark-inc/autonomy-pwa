'use strict';
const aws = require('aws-sdk');
const s3 = new aws.S3({ region: 'us-east-1' });
const fallbackS3BucketName = 'autonomy-pwa.test.bitmark.com';

let indexHtmlFileContent;
let webmanifestFileContent;

let getFileContentFromS3 = async (key) => {
  let data = await s3.getObject({
    Bucket: process.env.S3_BUCKET || fallbackS3BucketName,
    Key: key
  }).promise();
  return data.Body.toString();
}

let init = async () => {
  if (!indexHtmlFileContent || !webmanifestFileContent) {
    let results = await Promise.all([getFileContentFromS3('index.html'), getFileContentFromS3('manifest.webmanifest')]);
    indexHtmlFileContent = results[0];
    webmanifestFileContent = results[1];
  }
}

let extractPIDFromQueryString = (queryString) => {
  let rg = /pid=([^&]+)/;
  let results = rg.exec(queryString);
  if (results) {
    return results[1];
  }
  return null;
}

exports.handler = async (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const queryString = request.querystring;

  const manifestFileRequest = /manifest.webmanifest$/;
  const ucberkeleyRequest = /\/ucberkeley/;
  const resourceRequest = /(\.[a-zA-Z0-9]{2,5}$)/;
  
  let body;

  let isRequestToManifestFile = manifestFileRequest.test(request.uri);
  let isRequestToBekerleyFile = ucberkeleyRequest.test(request.uri);

  if ((isRequestToManifestFile || isRequestToBekerleyFile) && extractPIDFromQueryString(queryString)) {
    try {
      await init();
    } catch (err) {
      console.log(err);
      callback(err);
      return;
    }
  }

  if (isRequestToManifestFile) {
    body = webmanifestFileContent;
    let pid = extractPIDFromQueryString(queryString);
    if (pid) {
      body = body.replace(/"start_url":([^,]+),/, `"start_url": "/?pid=${pid}",`);
    }
  } else if (isRequestToBekerleyFile) {
    let pid = extractPIDFromQueryString(queryString);
    body = indexHtmlFileContent;
    body = body.replace(/<link rel="manifest"[^>]+>/, `<link rel="manifest" href="manifest.webmanifest?pid=${pid}">`);
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
