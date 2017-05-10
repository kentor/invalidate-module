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

## Example

Example when used with a watcher like [chokidar][c]:

`index.js`
```js
const chokidar = require('chokidar');
const path = require('path');

const invalidate = require('invalidate-module');

const watcher = chokidar.watch('.', { ignoreInitial: true });

require('./a');

watcher.on('all', (event, filename) => {
  invalidate(path.resolve(filename));
  require('./a');
});
```

`a.js`
```js
require('./b');
console.log('this is module a');
```

`b.js`
```js
console.log('this is module b');
```

Running `index.js` will call `require('./a')` which prints:
```
this is module b
this is module a
```

If you make this change to `a.js` and save:
```js
require('./b');
console.log('this is module a v2');
```

The watcher callback will fire and invalidate `a.js` so that `require('./a')`
loads the new version and this gets logged:
```
this is module a v2
```

Because `b.js` is still in `require.cache`, the `require('./b')` does nothing.

If you make this change to `b.js` and save:
```js
console.log('this is module b v2');
```

`b.js` and its dependent `a.js` will be invalidated and it will log:
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

[c]: https://github.com/paulmillr/chokidar
[p]: https://nodejs.org/api/path.html#path_path_resolve_paths
[r]: https://nodejs.org/api/globals.html#globals_require_resolve
