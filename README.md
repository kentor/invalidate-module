# invalidate-module

Removes a module and all of its dependents from the require cache, so that
subsequent requires of that module or any of its dependents will return new
copies.

Useful for implementing a hot-reloading environment of Node.js programs in watch
mode.

## Install

```
npm install invalidate-module
```

## Usage

Example when used with a watcher like `chokidar`:

`index.js`
```js
const chokidar = require('chokidar');
const path = require('path');

// required module dependencies are tracked:
const invalidate = require('invalidate-module');

const watcher = chokidar.watch('.', { ignoreInitial: true });

require('./a');

watcher.on('all', (event, filename) => {
  // invalidate works with absolute paths to modules:
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

Because `./b` is still in `require.cache`, the `require('./b')` does nothing.

If you make this change to `./b` and save:
```js
console.log('this is module b v2');
```

`./b` and its dependent `./a` will be invalidate and it will log:
```
this is module b v2
this is module a v2
```

## Details

At the time of requiring this module, node's `require()` is monkey-patched so
that subsequent calls will keep track of module dependencies with a graph. When
you call `invalidate()` on a module, it deletes the module from `require.cache`
and then it uses the graph to get the module's dependents and deletes them from
`require.cache`.

## Debug

Running with env vars `DEBUG=invalidate-module` will log the modules that are
deleted from `require.cache`.
