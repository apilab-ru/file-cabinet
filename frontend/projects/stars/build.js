const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    __dirname + '/dist/runtime.js',
    __dirname + '/dist/polyfills.js',
    __dirname + '/dist/runtime.js',
    __dirname + '/dist/main.js'
  ];

  await concat(files, '../extension/popup/stars.js');
  console.log('complete build!');
})();
