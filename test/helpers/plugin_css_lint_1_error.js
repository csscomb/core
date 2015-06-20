module.exports = {
  name: 'option1',
  syntax: ['css'],
  accepts: {
    boolean: [true, false]
  },
  lint: function() {
    return [{
    }];
  },
  process: function(ast) {
    ast.traverseByType('space', function(space) {
      space.content = '';
    });
  }
};
