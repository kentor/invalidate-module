const invalidate = require('../index');
const test = require('tape');

function inCache(m) {
  return require.cache[require.resolve(m)];
}

function reset() {
  ['./a', './b', './c', './d', './e'].forEach(m => {
    require(m);
  });
}

test('invalidates a leaf', t => {
  reset();
  invalidate(require.resolve('./a'));
  t.ok(!inCache('./a'));
  t.ok(inCache('./b'));
  t.ok(inCache('./c'));
  t.ok(inCache('./d'));
  t.ok(inCache('./e'));
  t.end();
});

test('invalidates a parent and its children', t => {
  reset();
  invalidate(require.resolve('./c'));
  t.ok(!inCache('./a'));
  t.ok(!inCache('./b'));
  t.ok(!inCache('./c'));
  t.ok(inCache('./d'));
  t.ok(inCache('./e'));
  t.end();
});

test('invalidates a module and all dependents', t => {
  reset();
  invalidate(require.resolve('./d'));
  t.ok(!inCache('./a'));
  t.ok(!inCache('./b'));
  t.ok(!inCache('./c'));
  t.ok(!inCache('./d'));
  t.ok(inCache('./e'));
  t.end();
});
