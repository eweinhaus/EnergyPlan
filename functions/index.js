const functions = require('firebase-functions');
const next = require('next');

// Configure Next.js for Firebase Functions
const nextjsServer = next({
  dev: false,
  conf: {
    distDir: '../.next', // Point to the Next.js build output
  },
});

const nextjsHandle = nextjsServer.getRequestHandler();

exports.nextjsFunc = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 300,
  })
  .https.onRequest((req, res) => {
    return nextjsServer.prepare().then(() => nextjsHandle(req, res));
  });
