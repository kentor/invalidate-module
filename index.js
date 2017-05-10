const debug = require('debug')('invalidate-module');
const Module = require('module');
const DepGraph = require('dependency-graph').DepGraph;

const graph = new DepGraph();
const __require = Module.prototype.require;

Module.prototype.require = function(path) {
  const requiredModule = __require.call(this, path);
  const requiredModuleFilename = Module._resolveFilename(path, this);
  graph.addNode(this.filename);
  graph.addNode(requiredModuleFilename);
  graph.addDependency(this.filename, requiredModuleFilename);
  return requiredModule;
};

function invalidate(absPathToModule) {
  if (graph.hasNode(absPathToModule)) {
    graph.dependantsOf(absPathToModule).concat([absPathToModule]).forEach(m => {
      delete require.cache[m];
      graph.removeNode(m);
      debug('deleted module from cache %s', m);
    });
  }
}

module.exports = invalidate;
