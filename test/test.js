const invalidate = require('../index');
const test = require('tape');

function resetAllTo2() {
  ['./a', './b', './c', './d', './e'].forEach(m => {
    invalidate(require.resolve(m));
  });

  for (let i = 0; i <= 2; i++) {
    ['./a', './b', './c', './d', './e'].forEach(m => {
      require(m)();
    });
  }
}

test('invalidates a leaf', t => {
  resetAllTo2();
  invalidate(require.resolve('./a'));
  t.equal(require('./a')(), 0);
  t.equal(require('./b')(), 3);
  t.equal(require('./c')(), 3);
  t.equal(require('./d')(), 3);
  t.equal(require('./e')(), 3);
  t.end();
});

test('invalidates a parent and its children', t => {
  resetAllTo2();
  invalidate(require.resolve('./c'));
  t.equal(require('./a')(), 0);
  t.equal(require('./b')(), 0);
  t.equal(require('./c')(), 0);
  t.equal(require('./d')(), 3);
  t.equal(require('./e')(), 3);
  t.end();
});

test('invalidates a module and all dependents', t => {
  resetAllTo2();
  invalidate(require.resolve('./d'));
  t.equal(require('./a')(), 0);
  t.equal(require('./b')(), 0);
  t.equal(require('./c')(), 0);
  t.equal(require('./d')(), 0);
  t.equal(require('./e')(), 3);
  t.end();
});
