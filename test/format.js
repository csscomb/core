var assert = require('assert');
var format = require('../lib/format');

describe('Message formatter', function() {
    it('should replace line breaks with a single space', function() {
        var string = 'a\nb\nc\n';
        var expected = 'a b c ';
        assert.equal(expected, format(string));
    });

    it('should replace line breaks and multiple spaces with a single space', function() {
        var string = 'a\n    b\n c\n';
        var expected = 'a b c ';
        assert.equal(expected, format(string));
    });

    it('should save spaces before line breaks', function() {
        var string = 'a \nb\nc  \n';
        var expected = 'a  b c   ';
        assert.equal(expected, format(string));
    });
});
