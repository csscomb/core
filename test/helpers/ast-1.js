var fs = require('fs');
var gonzales = require('gonzales-pe');

var css = fs.readFileSync(__dirname + '/file-1.css', 'utf-8');
var ast = gonzales.parse(css);

module.exports = ast;
