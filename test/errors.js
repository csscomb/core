var assert = require('assert');
var Errors = require('../lib/errors');

describe('Errors', function() {
  describe('implementSetValue', function() {
    it('should throw if argument is not passed', function() {
      assert.throws(function() {
        Errors.implementSetValue();
      });
    });

    it('should return a string with no undefined values', function() {
      var error = Errors.implementSetValue('boolean');
      assert.equal(error.indexOf('undefined'), -1);
    });

    it('should return a string with given value', function() {
      var error = Errors.implementSetValue('nani');
      assert.notEqual(error.indexOf('nani'), -1);
    });
  });

  describe('missingName', function() {
    it('should return a string with no undefined values', function() {
      var error = Errors.missingName();
      assert.equal(error.indexOf('undefined'), -1);
    });
  });

  describe('missingSetValue', function() {
    it('should return a string with no undefined values', function() {
      var error = Errors.missingSetValue();
      assert.equal(error.indexOf('undefined'), -1);
    });
  });

  describe('missingSyntax', function() {
    it('should return a string with no undefined values', function() {
      var error = Errors.missingSyntax();
      assert.equal(error.indexOf('undefined'), -1);
    });
  });

  describe('twoPluginsWithSameName', function() {
    it('should throw if argument is not passed', function() {
      assert.throws(function() {
        Errors.twoPluginsWithSameName();
      });
    });

    it('should return a string with no undefined values', function() {
      var error = Errors.twoPluginsWithSameName('plugin');
      assert.equal(error.indexOf('undefined'), -1);
    });

    it('should return a string with given value', function() {
      var error = Errors.twoPluginsWithSameName('nani');
      assert.notEqual(error.indexOf('nani'), -1);
    });
  });

  describe('unacceptableBoolean', function() {
    it('should throw if argument is not passed', function() {
      assert.throws(function() {
        Errors.unacceptableBoolean();
      });
    });

    it('should return a string with no undefined values', function() {
      var error = Errors.unacceptableBoolean([true, false]);
      assert.equal(error.indexOf('undefined'), -1);
    });

    it('should return a string with given value', function() {
      var error = Errors.unacceptableBoolean(['nani', 'panda']);
      assert.notEqual(error.indexOf('nani, panda'), -1);
    });
  });

  describe('unacceptableNumber', function() {
    it('should return a string with no undefined values', function() {
      var error = Errors.unacceptableNumber();
      assert.equal(error.indexOf('undefined'), -1);
    });
  });

  describe('unacceptableString', function() {
    it('should throw if argument is not passed', function() {
      assert.throws(function() {
        Errors.unacceptableString();
      });
    });

    it('should return a string with no undefined values', function() {
      var error = Errors.unacceptableString('plugin');
      assert.equal(error.indexOf('undefined'), -1);
    });

    it('should return a string with the given value', function() {
      var error = Errors.unacceptableString('nani');
      assert.notEqual(error.indexOf('nani'), -1);
    });
  });

  describe('unacceptableValueType', function() {
    it('should throw if argument is not passed', function() {
      assert.throws(function() {
        Errors.unacceptableValueType();
      });
    });

    it('should return a string with no undefined values', function() {
      var error = Errors.unacceptableValueType('string', {boolean: [true]});
      assert.equal(error.indexOf('undefined'), -1);
    });

    it('should return a string with no undefined values', function() {
      var error = Errors.unacceptableValueType('nani', {panda: 1, tomato: 1});
      assert.notEqual(error.indexOf('nani'), -1);
      assert.notEqual(error.indexOf('panda, tomato'), -1);
    });
  });
});
