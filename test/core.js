var assert = require('assert');
var gonzales = require('gonzales-pe');
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

    it('should not configure plugins that have not been added', function() {
      var config = {animal: 'panda'};
      comb.configure(config);
      assert.deepEqual(comb.config, {});
    });
  });

  describe('lintTree', function() {
    it('should return promise', function() {
      var ast = require('./helpers/ast-1');
      assert(typeof comb.lintTree(ast).then, 'function');
    });
  });
});
