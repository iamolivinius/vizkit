/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');

var app = new EmberApp();

app.import('vendor/d3/d3.js');
app.import('vendor/c3/c3.js');
app.import('vendor/c3/c3.css');
app.import('vendor/lodash/dist/lodash.js');
app.import('vendor/peity/jquery.peity.js');
app.import('vendor/socket.io-client/dist/socket.io.js');
app.import('vendor/fontawesome/css/font-awesome.css');

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

var extraAssets = pickFiles('vendor/fontawesome', {
    srcDir: '/fonts',
    // files: ['**/*.w#off', '**/stylesheet.css'],
    destDir: '/fonts'
});

// Merge the app tree and our new font assets.
module.exports = mergeTrees([app.toTree(), extraAssets]);
