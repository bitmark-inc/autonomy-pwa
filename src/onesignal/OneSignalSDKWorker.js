try {
  console.log('Try to load ngsw-worker...');
  importScripts('./ngsw-worker.js');
} catch (err) {
  console.log('Failed to load ngsw-worker, if this happened on production, please check');
}
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');
