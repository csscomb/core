require('babel/polyfill');
let gonzales = require('gonzales-pe');
let minimatch = require('minimatch');
let Errors = require('./errors');
let Plugin = require('./plugin');

let vow = require('vow');
let vfs = require('vow-fs');

let Comb = function() {
  this.config = {};
  this.plugins = [];
  this.pluginsDependencies = {};
  this.supportedSyntaxes = new Set();
};

Comb.prototype = {
  config: null,

  exclude: null,

  /**
   * Whether lint mode is on.
   * @type {Boolean}
   */
  lint: null,

  /**
   * List of file paths that should be excluded from processing.
   * @type {Array}
   */
  pathsToExclude: null,

  /**
   * List of used plugins.
   * @type {Array}
   */
  plugins: null,

  /**
   * @type {Array}
   */
  pluginsDependencies: null,

  /**
   * List of supported syntaxes.
   * @type {Array}
   */
  supportedSyntaxes: null,

  /**
   * Whether verbose mode is on.
   * @type {Boolean}
   */
  verbose: null,

  configure(config) {
    if (typeof config !== 'object')
      // TODO: throw error

    this.lint = config.lint;
    this.verbose = config.verbose;
    this.exclude = (config.exclude || []).map(function(pattern) {
      return new minimatch.Minimatch(pattern);
    });

    for (let i = 0, l = this.plugins.length; i < l; i++) {
      let plugin = this.plugins[i];
      let name = plugin.name;
      if (!config.hasOwnProperty(name)) continue;

      try {
        plugin.value = config[name];
        this.config[name] = plugin.value;
      } catch (e) {
        // TODO: throw error
      }
    }

    // Chaining.
    return this;
  },

  /**
   * @param {String} path
   * @returns {Promise}
   */
  lintDirectory(path) {
    let lint = this.lint;
    let that = this;
    this.lint = true;
    return this.processDirectory(path).then(function(errors) {
      that.lint = lint;
      return errors;
    });
  },

  /**
   * @param {String} path
   * @returns {Promise}
   */
  lintFile(path) {
    let lint = this.lint;
    let that = this;
    this.lint = true;
    return this.processFile(path).then(function(errors) {
      that.lint = lint;
      return errors;
    });
  },

  /**
   * @param {String} path
   * @returns {Promise}
   */
  lintPath(path) {
    let lint = this.lint;
    let that = this;
    this.lint = true;
    return this.processPath(path).then(function(errors) {
      that.lint = lint;
      return errors;
    });
  },

  /**
   * @param {String} text
   * @param {{context: String, filename: String, syntax: String}} options
   * @returns {Array} List of found errors
   */
  lintString(text, options) {
    let lint = this.lint;
    this.lint = true;
    let errors = this.processString(text, options);
    this.lint = lint;
    return errors;
  },

  /**
   * @param {Node} ast
   * @param {String} syntax
   * @param {String=} filename
   * @return {Array} List of errors
   */
  lintTree(ast, syntax, filename) {
    let errors = [];
    let config = this.config;

    this.plugins.filter(function(plugin) {
      return typeof plugin.value !== null &&
             typeof plugin.lint === 'function' &&
             plugin.syntax.indexOf(syntax) !== -1;
    }).forEach(function(plugin) {
      let e = plugin.lint(ast, syntax, config);
      errors = errors.concat(e);
    });

    if (filename) {
      errors.map(function(error) {
        error.filename = filename;
        return error;
      });
    }

    return errors;
  },

  pluginAlreadyUsed(name) {
    return this.pluginIndex(name) !== -1;
  },

  pluginIndex(name) {
    let index = -1;
    this.plugins.some(function(plugin, i) {
      if (plugin.name === name) {
        index = i;
        return true;
      }
    });
    return index;
  },

  /**
   * Processes directory recursively.
   *
   * @param {String} path
   * @returns {Promise}
   */
  processDirectory(path) {
    let that = this;

    return vfs.listDir(path).then(function(filenames) {
      return vow.all(filenames.map(function(filename) {
        let fullname = path + '/' + filename;
        return vfs.stat(fullname).then(function(stat) {
          if (stat.isDirectory() && that.shouldProcess(fullname)) {
            return that.processDirectory(fullname);
          } else {
            return that.processFile(fullname);
          }
        });
      })).then(function(results) {
        return [].concat.apply([], results);
      });
    });
  },

  /**
   * Processes single file.
   *
   * @param {String} path
   * @returns {Promise}
   */
  processFile(path) {
    let that = this;

    if (!this.shouldProcessFile(path)) return;

    return vfs.read(path, 'utf8').then(function(data) {
      let syntax = path.split('.').pop();
      let processedData = that.processString(data, {
        syntax: syntax,
        filename: path
      });

      if (that.lint) return processedData;

      if (data === processedData) {
        if (that.verbose) console.log(' ', path);
        return 0;
      }

      return vfs.write(path, processedData, 'utf8').then(function() {
        if (that.verbose) console.log('✓', path);
        return 1;
      });
    });
  },

  /**
   * Processes directory or file.
   *
   * @param {String} path
   * @returns {Promise}
   */
  processPath(path) {
    let that = this;
    path = path.replace(/\/$/, '');

    return vfs.exists(path).then(function(exists) {
      if (!exists) {
        console.warn('Path ' + path + ' was not found.');
        return;
      }
      return vfs.stat(path).then(function(stat) {
        if (stat.isDirectory()) {
          return that.processDirectory(path);
        } else {
          return that.processFile(path);
        }
      });
    });
  },

  /**
   * Processes a string.
   *
   * @param {String} text
   * @param {{context: String, filename: String, syntax: String}} options
   * @returns {String} Processed string
   */
  processString(text, options) {
    let syntax = options && options.syntax;
    let filename = options && options.filename || '';
    let context = options && options.context;
    let tree;

    if (!text) return this.lint ? [] : text;

    if (!syntax) syntax = 'css';
    this.syntax = syntax;

    try {
      tree = gonzales.parse(text, {syntax: syntax, rule: context});
    } catch (e) {
      let version = require('../package.json').version;
      let message = filename ? [filename] : [];
      message.push(e.message);
      message.push('CSScomb Core version: ' + version);
      e.stack = e.message = message.join('\n');
      throw e;
    }

    if (this.lint) {
      return this.lintTree(tree, syntax, filename);
    } else {
      return this.processTree(tree, syntax).toString();
    }
  },

  /**
   * @param {Node} ast
   * @param {String} syntax
   * @return {Node} Transformed AST
   */
  processTree(ast, syntax) {
    let config = this.config;

    this.plugins.filter(function(plugin) {
      return plugin.value !== null &&
             typeof plugin.process === 'function' &&
             plugin.syntax.indexOf(syntax) !== -1;
    }).forEach(function(plugin) {
      plugin.process(ast, syntax, config);
    });

    return ast;
  },

  /**
   * Checks if path is not present in `exclude` list.
   *
   * @param {String} path
   * @returns {Boolean} False if specified path is present in `exclude` list.
   * Otherwise returns true.
   */
  shouldProcess(path) {
    path = path.replace(/^\.\//, '');
    return this.exclude.every(function(e) {
      return !e.match(path);
    });
  },

  /**
   * Checks if specified path is not present in `exclude` list and it has one of
   * acceptable extensions.
   *
   * @param {String} path
   * @returns {Boolean} False if the path either has unacceptable extension or
   * is present in `exclude` list. True if everything is ok.
   */
  shouldProcessFile(path) {
    // Get file's extension:
    var syntax = path.split('.').pop();

    // Check if syntax is supported. If not, ignore the file:
    if (!this.supportedSyntaxes.has(syntax))
      return false;

    return this.shouldProcess(path);
  },

  /**
   * Add a plugin.
   * @param {Object} options
   * @return {Comb}
   */
  use(options) {
    // Check whether plugin with the same is already used.
    let pluginName = options.name;
    if (this.pluginAlreadyUsed(pluginName)) {
      if (this.verbose)
        console.warn(Errors.twoPluginsWithSameName(pluginName));
      return;
    }

    let plugin = new Plugin(options);

    plugin.syntax.forEach(function(s) {
      this.supportedSyntaxes.add(s);
    }, this);

    // Sort plugins.
    let pluginToRunBefore = plugin.runBefore;

    if (!pluginToRunBefore) {
      this.plugins.push(plugin);
    } else {
      if (this.pluginAlreadyUsed(pluginToRunBefore)) {
        let i = this.pluginIndex(pluginToRunBefore);
        this.plugins.splice(i, 0, plugin);
      } else {
        this.plugins.push(plugin);
        if (!this.pluginsDependencies[pluginToRunBefore])
          this.pluginsDependencies[pluginToRunBefore] = [];
        this.pluginsDependencies[pluginToRunBefore].push(pluginName);
      }
    }

    let dependents = this.pluginsDependencies[pluginName];
    if (!dependents) return;

    for (let i = 0, l = dependents.length; i < l; i++) {
      let name = dependents[i];
      let x = this.pluginIndex(name);
      let plugin = this.plugins[x];
      this.plugins.splice(x, 1);
      this.plugins.splice(-1, 0, plugin);
    }

    // Chaining.
    return this;
  }
};

module.exports = Comb;
