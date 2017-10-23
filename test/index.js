import 'angular'
import 'angular-mocks'
// This will search for files ending in .test.js and require them
// so that they are added to the webpack bundle
let context = require.context('.', true, /.+\.test\.ts?$/);
context.keys().forEach(context);
module.exports = context;