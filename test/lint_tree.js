// Depends on: getSyntax(), gonzales

var Comb = require('../lib/core');
var assert = require('assert');
var gonzales = require('gonzales-pe');

describe.only('lintTree()', function() {
    it('Skip handlers that do not support given syntax', function() {
        var comb = new Comb();
        var ast = {};
        comb.plugins = [{
            syntax: ['css']
        }];
        assert.deepEqual([], comb.lintTree(ast, 'less'));
    });

    it('Skip handlers that have no `lint` method', function() {
        var comb = new Comb();
        var ast = {};
        comb.plugins = [{
            syntax: ['css']
        }];
        assert.deepEqual([], comb.lintTree(ast, 'css'));
    });

    it('Should lint, one error', function() {
        var comb = new Comb();
        var ast = originalAST = gonzales.parse('a{color:red}');
        var error = {line:1, column: 7, message: 'foo'};
        comb.plugins = [{
            value: true,
            syntax: ['css'],
            lint: function() {
                return [error];
            }
        }];
        assert.deepEqual([error], comb.lintTree(ast, 'css'));
        // Should not modify ast:
        assert.deepEqual(originalAST, ast);
    });

    it('Should lint, multiple errors', function() {
        var comb = new Comb();
        var ast = originalAST = gonzales.parse('a{color:red}');
        var error = {line:1, column: 7, message: 'foo'};
        comb.plugins = [{
            syntax: ['css'],
            lint: function(node) {
                return [error, error];
            }
        }];
        assert.deepEqual([error, error], comb.lintTree(ast, 'css'));
        // Should not modify ast:
        assert.deepEqual(originalAST, ast);
    });
});
