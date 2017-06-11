# invalidate-module

[![Build Status](https://travis-ci.org/kentor/invalidate-module.svg)](https://travis-ci.org/kentor/invalidate-module) [![npm](https://img.shields.io/npm/v/invalidate-module.svg)](https://www.npmjs.com/package/invalidate-module)

Removes a module and all of its dependents from the require cache, so that
subsequent requires of that module or any of its dependents will return new
copies.

Useful for implementing a hot-reloading environment for Node.js programs in
watch mode.

e.g. iterating on a static site generator that uses server side rendered
React components for templating.

## Install

```
npm install invalidate-module
```

## Usage

Start the module dependencies tracking by requiring `invalidate-module`.

```js
const invalidate = require('invalidate-module');
```

Call `invalidate()` with the absolute path of a module to remove it and its
dependents from `require.cache`.

```js
invalidate(require.resolve('./my-module'));
```

Note that you must provide the absolute path of the module, so use something
like [`require.resolve()`][r] or [`path.resolve()`][p].

Now the next time you call `require('./my-module')`, it will return a new copy
of `./my-module` instead of a cached copy.

## Example

Example when used with a watcher like [chokidar][c]:

```js
// watch.js
const chokidar = require('chokidar');
const invalidate = require('invalidate-module');
const path = require('path');

const watcher = chokidar.watch('*.js', { ignoreInitial: true });

require('./a');

watcher.on('all', (event, filename) => {
  invalidate(path.resolve(filename));
  require('./a');
});
```

```js
// a.js
require('./b');
console.log('this is module a');
```

```js
// b.js
console.log('this is module b');
```

Running `watch.js` will call `require('./a')` which prints:
```
this is module b
this is module a
```

If you make this change to `a.js` and save:
```js
// a.js
require('./b');
console.log('this is module a, version 2');
```

The watcher callback will fire and invalidate `a.js` so that `require('./a')`
loads the new version and this gets logged:
```
this is module a version 2
```

Because `b.js` is still in `require.cache`, the `require('./b')` does nothing.

If you make this change to `b.js` and save:
```js
// b.js
console.log('this is module b version 2');
```

`b.js` and its dependent `a.js` will be invalidated and re-running
`require('./a')` in the watch callback will log:
```
this is module b v2
this is module a v2
```

## Details

At the time of requiring this module, node's `require()` is monkey-patched so
that subsequent calls will add the caller module and the required module to a
graph. When you call `invalidate()` on a module, it deletes the module from
`require.cache` and then it uses the graph to get the module's dependents and
deletes them from `require.cache` as well.

## Debug

Running with env vars `DEBUG=invalidate-module` will log the modules that are
deleted from `require.cache`.

## Further Reading
- My [blog post][b] on this subject.
- [node-hot-reloading-boilerplate][n]

[b]: https://kentor.me/posts/node-js-hot-reloading-development/
[c]: https://github.com/paulmillr/chokidar
[n]: https://github.com/kentor/node-hot-reloading-boilerplate
[p]: https://nodejs.org/api/path.html#path_path_resolve_paths
[r]: https://nodejs.org/api/globals.html#globals_require_resolve
