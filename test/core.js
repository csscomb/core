var assert = require('assert');
var fs = require('fs');
var minimatch = require('minimatch');
var Comb = require('../lib/core');

var comb;

describe('Core methods', function() {
  beforeEach(function() {
    comb = new Comb();
  });

  describe('configure', function() {
    it('should throw with no config', function() {
      assert.throws(function() {
        comb.configure();
      });
    });

    it('should throw if config is not an object', function() {
      assert.throws(function() {
        comb.configure('nani');
      });
    });

    it('should copy simple fields from config', function() {
      var config = {lint: false, verbose: true};
      comb.configure(config);
      assert.equal(comb.lint, config.lint);
      assert.equal(comb.verbose, config.verbose);
    });

    it('should extend `exclude` patterns', function() {
      var pattern = 'panda/**/*.ext';
      var minimatchedPattern = new minimatch.Minimatch(pattern);
      var config = {exclude: [pattern]};
      comb.configure(config);
      assert.deepEqual(comb.exclude, [minimatchedPattern]);
    });

    it('should create syntax map', function() {
      var config = {syntax: {'.css': 'scss'}};

      comb.configure(config);
      assert.equal(comb.syntaxMap.size, 1);
      assert.equal(comb.syntaxMap.get('.css'), 'scss');
    });

    it('should not configure plugins that have not been added', function() {
      var config = {animal: 'panda'};
      comb.configure(config);
      assert.deepEqual(comb.config, {});
    });
  });

  describe('lintDirectory', function() {
    var plugin = require('./helpers/plugin_css_lint_1_error');

    it('should return promise', function() {
      var dir = __dirname;
      assert(comb.lintDirectory(dir).then, 'function');
    });

    it('should lint all files in the directory', function(done) {
      var dir = __dirname + '/helpers';
      comb.use(plugin).configure({option1: true})
          .lintDirectory(dir).then(function(errors) {
            assert.equal(errors.length, 1);
            done();
          });
    });

    it('should lint all files recursively', function(done) {
      var dir = __dirname;
      comb.use(plugin).configure({option1: true})
          .lintDirectory(dir).then(function(errors) {
            assert.equal(errors.length, 1);
            done();
          });
    });
  });

  describe('lintFile', function() {
    var plugin = require('./helpers/plugin_css_lint_1_error');
    var cssFile = __dirname + '/helpers/file.css';
    var jsFile = __dirname + '/helpers/ast_css.js';

    it('should return promise', function() {
      assert(comb.lintFile(cssFile).then, 'function');
    });

    it('should return 1 error', function(done) {
      comb.use(plugin).configure({option1: true})
          .lintFile(cssFile).then(function(errors) {
            assert.equal(errors.length, 1);
            done();
          });
    });

    it('should skip unacceptable file', function(done) {
      comb.use(plugin).configure({option1: true})
          .lintFile(jsFile).catch(function() {
            done();
          });
    });

    it('should use syntax from config', function(done) {
      comb.use(require('./helpers/plugin_syntax_map'))
        .configure({
          'syntax-map': true,
          syntax: {
            '.tcss': 'scss'
          }
        })
        .lintFile(__dirname + '/helpers/scss.tcss')
        .then(function() {
          done();
        });
    })
  });

  describe('lintPath', function() {
    var plugin = require('./helpers/plugin_css_lint_1_error');
    var file = __dirname + '/helpers/file.css';
    var dir = __dirname;

    it('should return promise', function() {
      assert(comb.lintPath(file).then, 'function');
    });

    it('should lint a file', function(done) {
      comb.use(plugin).configure({option1: true})
          .lintPath(file).then(function(errors) {
            assert.equal(errors.length, 1);
            done();
          });
    });

    it('should lint a directory', function(done) {
      comb.use(plugin).configure({option1: true})
          .lintPath(dir).then(function(errors) {
            assert.equal(errors.length, 1);
            done();
          });
    });
  });

  describe('lintString', function() {
    var plugin = require('./helpers/plugin_css_lint_1_error');
    var string = fs.readFileSync(__dirname + '/helpers/file.css', 'utf-8');

    it('should return promise', function() {
      assert(comb.lintString(string).then, 'function');
    });

    it('should return 1 error', function(done) {
      comb.use(plugin).configure({option1: true})
          .lintString(string).then(function(errors) {
            assert.equal(errors.length, 1);
            done();
          });
    });
  });

  describe('processString', function() {
    var plugin = require('./helpers/plugin_css_lint_1_error');
    var string = fs.readFileSync(__dirname + '/helpers/file.css', 'utf-8');

    it('should return promise', function() {
      assert(typeof comb.processString(string).then, 'function');
    });

    it('should return modified string', function(done) {
      comb.use(plugin).configure({option1: true})
          .processString(string).then(function(modifiedString) {
            var numberOfSpaces = modifiedString.split(' ').length - 1;
            // There should be 2 spaces left inside comment.
            assert.equal(numberOfSpaces, 2);
            done();
          });
    });
  });

  describe('_lintTree', function() {
    var ast = require('./helpers/ast_css');
    var plugin = require('./helpers/plugin_css_lint_1_error');

    it('should return promise', function() {
      assert(typeof comb._lintTree(ast).then, 'function');
    });

    it('should return 1 error', function(done) {
      comb.use(plugin).configure({option1: true})
          ._lintTree(ast).then(function(errors) {
            assert.equal(errors.length, 1);
            done();
          });
    });

    it('should add filename to errors', function(done) {
      comb.use(plugin).configure({option1: true})
          ._lintTree(ast, 'panda').then(function(errors) {
            assert.equal(errors[0].filename, 'panda');
            done();
          });
    });
  });

  describe('_processTree', function() {
    var ast = require('./helpers/ast_css');
    var plugin = require('./helpers/plugin_css_lint_1_error');

    it('should return promise', function() {
      assert(typeof comb._processTree(ast).then, 'function');
    });

    it('should return modified ast', function(done) {
      comb.use(plugin).configure({option1: true})
          ._processTree(ast).then(function(ast) {
            var numberOfSpaces = ast.toString().split(' ').length - 1;
            // There should be 2 spaces left inside comment.
            assert.equal(numberOfSpaces, 2);
            done();
          });
    });
  });
});
