import _ from "lodash";
import _castArray from "lodash/castArray";
import _concat from "lodash/concat";
import _every from "lodash/every";
import _filter from "lodash/filter";
import _find from "lodash/find";
import _forEach from "lodash/forEach";
import _head from "lodash/head";
import _identity from "lodash/identity";
import _includes from "lodash/includes";
import _isArray from "lodash/isArray";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _isInteger from "lodash/isInteger";
import _isNil from "lodash/isNil";
import _isString from "lodash/isString";
import _isUndefined from "lodash/isUndefined";
import _join from "lodash/join";
import _last from "lodash/last";
import _map from "lodash/map";
import _reverse from "lodash/reverse";
import _some from "lodash/some";
import _split from "lodash/split";
import _startsWith from "lodash/startsWith";
import _tail from "lodash/tail";
import _take from "lodash/take";
import _takeRight from "lodash/takeRight";

/**
 * A Tree object
 * 
 * The Tree object is a tree of nodes where each node is a key-value pair.
 * 
 * Strings, or Arrays of Strings, may be used as a key.
 * 
 * Any value (both objects and primitive values) may be used as a value.
 * @module Tree
 */
export { Tree };

// cmon why no static props?
const ROOT_NODE_ID = "root";
const PATH_STRING_DELIMITER = "|";

/**
 * @alias module:Tree
 * @classdesc Class representing a tree.
 * 
 * Paths provided to the tree must strings, or arrays of strings.
 * 
 * Paths are not required to include the root node id.
 * 
 * The static Tree.factory method is favored over the direct use of the constructor.
 */
class Tree {
  /**
   * The path_string_delimiter, root_node_id, and distinct properties are set in the constructor and cannot be reset.
   * 
   * For parameter details see the static Factory method.
   * 
   * @param {*} datum Optional.
   * Defaults to undefined.
   *
   * @param {String} root_node_id Optional. 
   * Defaults to "root".
   *
   * @param {String} path_string_delimiter Optional.
   * Defaults to a pipe '|'.
   *
   * @param {Map} dataMap Optional.
   * Defaults to a Map.
   *
   * @param {Boolean} distinct Optional. 
   * Defaults to True.
   *
   * @param {String} show_root Optional.
   * Defaults to 'auto'.
   *
   * @throws show_root must be one of: 'yes', 'no', or 'auto'.
   */
  constructor(
    datum,
    root_node_id = ROOT_NODE_ID,
    path_string_delimiter = PATH_STRING_DELIMITER,
    dataMap,
    distinct = true,
    show_root = "auto" // yes | no | auto
  ) {
    //    Object.defineProperty(this, 'path_string_delimiter', {
    //      get: function() {
    //        return path_string_delimiter;
    //      }
    //    });
    Object.defineProperty(this, "path_string_delimiter", {
      configurable: false,
      enumerable: true,
      value: path_string_delimiter,
      writable: false
    });
    Object.defineProperty(this, "root_node_id", {
      configurable: false,
      enumerable: true,
      value: root_node_id,
      writable: false
    });
    Object.defineProperty(this, "distinct", {
      configurable: false,
      enumerable: true,
      value: distinct,
      writable: false
    });

    this.__dataMap = dataMap || new Map(); //key = path[], value = {data} thar be data
    this.__dataMap.set(root_node_id, datum);
    if (show_root) {
      if (!_includes(["yes", "no", "auto"], show_root)) this.__excp(3);
    }
    this.show_root = show_root;
  }

  /**
   * @typedef {Object} FactoryOptions
   * @param {*} datum Optional.
   * Defaults to undefined.
   * 
   * The data associated with the root node.
   *
   * @property {String} root_node_id Optional.
   * Defaults to "root".
   * 
   * The name used for the root node.
   * 
   * n.b. The root_node_id is set in the constructor and cannot be reset.
   *
   * @property {String} path_string_delimiter, Optional.
   * Defaults to a pipe "|".
   * 
   * The internal delimiter for paths ("|").
   * 
   * n.b. The path_string_delimiter is set in the constructor and cannot be reset.
   *
   * @property {Map} dataMap Optional.
   * Defaults to a Map.
   * 
   * Internal storage for the tree.
   *
   * @property {Boolean} distinct Optional.
   * Defaults to True.
   * 
   * Distinct trees have node ids which are never duplicated at any depth or breadth within the tree.
   * When distinct is true the ancestor attribute is enabled (but not required) in the set method.
   * Because node ids are unique, distinct trees can find nodes by node id alone.
   * A node id must always be a string which does not contain the path_string_delimiter, or a single element array.
   * Distinct trees never use node id paths.
   *
   * Non distinct trees may have the same node id appear in more than one place in the tree structure.
   * When distinct is false the ancestor attribute is disallowed in the set method.
   * Because node ids may appears in multiple places, keys must be full node id paths.
   *
   * @property {String} show_root Optional
   * Defaults to 'auto'.
   * 
   * One of : 'yes', 'no', or 'auto'.
   * 
   * Applies to non distinct trees only.
   * 
   * When 'yes' the root node is included in node id paths.
   * 
   * When 'no'  the root node is not included in node id paths.
   * 
   * When 'auto' the root node is included when it's datum is not undefined.
   */

   /**
   * Factory method to create a new Tree.
   * 
   * The factory method is favored over direct use of the constructor.
   * @static
   * @param {FactoryOptions} Optional.
   * See constructor for object contents.
   */
  static factory({
    datum,
    root_node_id,
    path_string_delimiter,
    dataMap,
    distinct,
    show_root
  } = {}) {
    return new Tree(
      datum,
      root_node_id,
      path_string_delimiter,
      dataMap,
      distinct,
      show_root
    );
  }

  /**
   * @readonly
   * @returns {Number} The count of nodes in the longest path, including the root.
   */
  get depth() {
    return _([...this.__dataMap.keys()])
      .map((key) => this.__s2p(key).length)
      .max();
  }

  /**
   * @readonly
   * @returns {Boolean} True when a node other than the root node exists, else False.
   */
  get hasDescendents() {
    return this.__dataMap.size > 1;
  }

  /**
   * @readonly
   * @returns {Array} The key to the root node as an Array.
   */
  get rootNodePath() {
    return _castArray(this.root_node_id);
  }

  /**
   * @readonly
   * @returns {Number} The number of nodes including the root node.
   */
  get size() {
    return this.__dataMap.size;
  }

  /**
   * Apply a function to a node's descendents, and optionally to the node itself.
   * 
   * NOTE: The order of application is NOT guaranteed.
   * 
   * @param {Function} fn Optional.
   * Defaults to _.identity.
   * 
   * The function to apply to each node; receives an entry and tree as arguments.
   * The function MUST return a [path, datum] entry or undefined.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @param {Boolean} inclusive Optional.
   * Defaults to false.
   * 
   * When true, the entry for the path itself will also be provided to the function.
   * @returns {Void}
   * @throws node does not exist, use has?
   * @throws function provided must return undefined or an [path, datum] entry
   */
  cascade(fn = _identity, path, inclusive = false) {
    if (!this.has(path)) this.__excp(4, { path });
    path = this.__derive(path);

    const target = this.__p2s(path);
    let fe = _filter([...this.__dataMap.entries()], ([sk, d]) => {
      if (!inclusive && sk === target) return false;
      return _startsWith(sk, target);
    });
    fe = _.map(fe, ([k, v]) => [this.__p2228t(k), v]);

    _forEach(fe, (entry) => {
      const [ek, ev] = entry;
      const ret = fn([ek, ev], this);
      if (_isUndefined(ret)) return;
      // entry must be an entry (array with path & datum elements) or undefined
      if (!_isArray(ret) || ret.length <= 1) this.__excp(5);

      // we don't know what key we're getting back but we better have it
      let [p, v] = ret;
      if (!this.has(p)) this.__excp(4, { path: p });

      p = this.__derive(p);
      this.__dataMap.set(this.__p2s(p), v);
    });
  }

  /**
   * Clear all nodes and datums.
   * @returns {Void}
   */
  clear() {
    this.__dataMap.clear();
    this.__dataMap.set(this.root_node_id, undefined);
  }

  /**
   * Remove a node and its descendents.
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.

   * When undefined, blank, or empty, the root node's path will be utilized.

   * @param {Boolean} inclusive Optional.
   * Defaults to true.

   * When true, the entry for the path itself will be included in the group to be deleted.

   * @return {Boolean} True when the node(s) to be removed exist(s), else False.
   */
  delete(path, inclusive = true) {
    const p = this.__derive(path);
    const target = this.__p2s(p);

    let keys = _filter([...this.__dataMap.keys()], (k) => {
      if (!inclusive && k === target) return false;
      return _startsWith(k, target);
    });

    let allTrue = Boolean(keys.length);
    _forEach(keys, (k) => {
      allTrue = allTrue && this.__dataMap.delete(k);
    });
    return allTrue;
  }

  /**
   * Provide a set of entries which match a path's descendents, and optionally include the path's entry.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * @param {Boolean} inclusive Optional.
   * Defaults to False.
   * 
   * When True, the entry for the path itself will be included.
   * 
   * @param {Boolean} nested Optional.
   * Defaults to False.
   * 
   * Defines how the output array is returned.
   * 
   * @param {integer} depth Optional.
   * Defaults to the maximum depth of the tree.
   * 
   * An integer representing the maximum depth from the path.
   * 
   * @returns {Array}
   * When nested is False, returns an array of [key, datum] entries.
   * 
   * When nested is True, returns a nested array of [key, datum, descendents] entries.
   * 
   * When the distinct property of the tree is True, keys are returned as node ids.
   * 
   * NOTE: insertion order is NOT guaranteed.
   * 
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */

  entriesOf(path, inclusive = false, nested = false, depth) {
    const p = this.__derive(path);

    if (depth && !_isInteger(depth)) this.__excp(6);

    if (depth === 0 && !inclusive) this.__excp(7);

    const maxDepth = depth ? p.length + depth : this.depth;
    const target = this.__p2s(p);
    let fe = _filter([...this.__dataMap.entries()], ([sk, d]) => {
      const ak = this.__s2p(sk);
      if (!inclusive && sk === target) return false;
      return _startsWith(sk, target) && ak.length <= maxDepth;
    });

    if (!nested) return _map(fe, ([k, v]) => [this.__p2228t(k), v]);

    const nest = (entries) => {
      return _map(entries, ([tk, v]) => {
        const ak = this.__s2p(tk);
        const descendents = _filter(
          fe,
          ([k, v]) =>
            _startsWith(k, tk) && this.__s2p(k).length === ak.length + 1
        );
        return [
          this.__p2228t(tk),
          v,
          descendents.length ? nest(descendents) : []
        ];
      });
    };

    // minimum depth
    const mnd = _(fe)
      .map((key) => this.__s2p(key).length)
      .min();

    // base nodes. we won't sort so maybe the top nodes will remain in insertion order
    const bn = _filter(fe, ([k, v]) => this.__s2p(k).length === mnd);
    return nest(bn);
  }

  /**
   * Tests whether all qualifying entries pass the test implemented by the provided function.
   *
   * WARNING: When the qualifiying entries are an empty array this method returns True.

   * @param {Function} fn Optional.
   * Defaults to _.identity.
   *
   * The function to apply to each node which should return truthy or falsey.
   *
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   *
   * When undefined, blank, or empty, the root node's path will be utilized.
   *
   * @param {Boolean} inclusive Optional.
   * Defaults to false.
   *
   * When True, the entry for the path itself will also be provided to the function.
   *
   * @param {integer} depth Optional.
   * Defaults to the maximum depth of the tree.
   *
   * An integer representing the maximum depth from the path.
   *
   * @returns {Boolean} True when all qualifying entries pass the test implemented by the provided function, else False.
   *
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  everyOf(fn = _identity, path, inclusive = false, depth) {
    if (!this.has(path)) this.__excp(4, { path });
    const p = this.__derive(path);

    if (depth && !_isInteger(depth)) this.__excp(6);

    if (depth === 0 && !inclusive) this.__excp(7);

    const maxDepth = depth ? p.length + depth : this.depth;

    const target = this.__p2s(p);
    let fe = _filter([...this.__dataMap.entries()], ([sk, d]) => {
      const ak = this.__s2p(sk);
      if (!inclusive && sk === target) return false;
      return _startsWith(sk, target) && ak.length <= maxDepth;
    });
    fe = _.map(fe, ([k, v]) => [this.__p2228t(k), v]);

    return _every(fe, fn);
  }

  /**
   * Provide a set of entries which match a path's immediate descendents.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   *
   * When undefined, blank, or empty, the root node's path will be used.
   * 
   * @returns {Array}
   * 
   * A flat array of [key, datum] entries for the immediate descendents of the path.
   * 
   * NOTE: insertion order is not guaranteed.
   * 
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   */
  firstDescendentsOf(path) {
    const p = this.__derive(path);

    const fdo = ([sk, v]) => {
      if (this.__s2p(sk).length !== p.length + 1) return false;
      return _startsWith(sk, this.__p2s(p));
    };

    return _([...this.__dataMap.entries()])
      .filter(fdo)
      .map(([sk, v]) => [this.__p2228t(sk), v])
      .value();
  }

  /**
   * Get a node's value.
   * 
   * NOTE: An exception is thrown when the path does not exist.
   * 
   * In contrast to the Map api, an exception is thrown because the value of a node is allowed to be undefined.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be used.
   * 
   * @returns The datum at the path.
   * 
   * @throws path must be an array or string
   * @throws node does not exist, use has()?
   */
  get(path) {
    if (!this.has(path)) this.__excp(4, { path });
    const p = this.__derive(path);
    return this.__dataMap.get(this.__p2s(p));
  }

  /**
   * Get a node's ancestor's value.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @returns The datum of the ancestor of the path.
   * 
   * @throws path must be an array or string
   * @throws node does not exist, use has()?
   * @throws no ancestor exists for root node
   */
  getAncestorOf(path) {
    if (!this.has(path)) this.__excp(4, { path });
    const { parentPath } = this.__meta(this.__derive(path));
    if (_isEmpty(parentPath)) this.__excp(8, { path: this.root_node_id });
    return this.get(parentPath);
  }

  /**
   * Check whether a node exists.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @returns {Boolean} True when the datum for a node exists for the derived path (including undefined), else False.
   * 
   * @throws path must be an array or string
   */
  has(path) {
    const p = this.__derive(path);
    return this.__dataMap.has(this.__p2s(p));
  }

  /**
   * Provide a set of keys which match a path's descendents, and optionally include the path's key.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @param {Boolean} inclusive Optional.
   * Defaults to False.
   * 
   * When True, the entry entry for the path itself will be included.
   * 
   * @param {Boolean} nested Optional.
   * Defaults to False.
   * 
   * Defines how the output array is returned.
   * 
   * @param {integer} depth Optional.
   * Defaults to the maximum depth of the tree.
   * 
   * An integer representing the maximum depth of elements qualifying for return.
   * 
   * @returns {Array}
   * 
   * When nested is False, returns an array of keys.
   * 
   * When nested is True, returns a nested array of [key, descendents] entries.
   * 
   * When the distinct property of the tree is True, keys will be returned as node ids.
   * 
   * NOTE: insertion order is NOT guaranteed.
   * 
   * @throws path must be an array or a string
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  keysOf(path, inclusive = false, nested = false, depth) {
    const p = this.__derive(path);

    if (depth && !_isInteger(depth)) this.__excp(6);

    if (depth === 0 && !inclusive) this.__excp(7);

    const maxDepth = depth ? p.length + depth : this.depth;
    const target = this.__p2s(p);

    let fe = _filter([...this.__dataMap.keys()], (k) => {
      const ak = this.__s2p(k);
      if (!inclusive && k === target) return false;
      return _startsWith(k, target) && ak.length <= maxDepth;
    });

    if (!nested) return _map(fe, (k) => this.__p2228t(k));

    const nest = (keys) => {
      return _map(keys, (tk) => {
        const ak = this.__s2p(tk);
        const descendents = _filter(
          fe,
          (k) => _startsWith(k, tk) && this.__s2p(k).length === ak.length + 1
        );
        return [this.__p2228t(tk), descendents.length ? nest(descendents) : []];
      });
    };

    // minimum depth
    const mnd = _(fe)
      .map((key) => this.__s2p(key).length)
      .min();

    // base nodes. we won't sort so at least the top nodes will remain in insertion order
    const bn = _filter(fe, (k) => this.__s2p(k).length === mnd);
    return nest(bn);
  }

  /**
   * Merge a Tree into an existing target Tree.
   * @param {Tree} source
   * @throws non distinct trees cannot be merged into distinct trees
   */
  merge(source) {
    if (this.disinct && !source.disinct) this.__excp(9);

    const ies = source.__dataMap.entries();
    const entries = _.map([...ies], ([k, v]) => [
      _split(k, source.path_string_delimiter),
      v
    ]);
    _forEach(entries, ([k, v]) => this.set(k, v));
  }

  /**
   * Append or update a datum at the path provided.
   * 
   * NOTE: When the path argument is a node id path array, intermediate nodes which do not exist will be provided a datum of undefined.
   * 
   * NOTE: The ancestor argument is invalid and therefore ignored for a Tree whose distinct property is false.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @param {*} datum Optional.
   * Defaults to undefined.
   * 
   * Value to be associated with the path.
   * 
   * @param {String} ancestor Optional.
   * 
   * Ignored when the path is not provided.
   * 
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * @returns {Array} The path assigned to the datum.
   * 
   * @throws path must be a simple string (when the ancestor provided is not a simple string)
   * @throws elements in a path cannot be empty strings
   * @throws ancestor does not exist (when the ancestor is provided is not in the tree)
   * @throws ancestor cannot be used on distinct trees, full node id paths are required
   * @throws ancestor must be a simple string or single element array
   * @throws path already exists in this distinct tree
   * @throws elements in a path cannot be duplicated with distinct trees
   */
  set(path, datum = undefined, ancestor = undefined) {
    let d,
      p = path;
    p = this.__derive(p);
    let exists = this.__dataMap.has(this.__p2s(p));
    let meta = this.__meta(p);

    if (!_isNil(ancestor)) {
      if (!this.distinct) this.__excp(11, { ancestor, path });

      if (!_isString(ancestor) && !_isArray(ancestor)) this.__excp(10);

      d = _isString(ancestor) ? _castArray(ancestor) : ancestor;
      if (d.length > 1) this.__excp(10);
    }

    if (this.distinct) {
      if (!_isNil(ancestor)) {
        if (exists) {
          // no duplicate node id!
          d = _isString(ancestor) ? _castArray(ancestor) : ancestor;
          const ta = this.__p2s(d);

          if (ta !== meta.distinctAncestor)
            this.__excp(12, { path, ancestor: ta });

          // is it update
          this.__dataMap.set(this.__p2s(p), datum);
          return this.__p2228t(p);
        }

        // i.e. root + something
        if (p.length > 2) this.__excp(14, { path, datum, ancestor });

        // do ancestry now
        d = this.__derive(ancestor);
        if (!this.__dataMap.has(this.__p2s(d))) this.__excp(15, { ancestor });

        p = _concat(d, _tail(p));
      }

      // distinctness checks
      _forEach(p, (tip, i) => {
        const nidx = i + 1;
        let k = this.__p2s(_take(p, nidx));
        let np = this.__derive(tip);
        let ta = this.__p2s(np);
        exists = this.__dataMap.has(ta);
        if (exists & (k !== ta)) {
          meta = this.__meta(np);
          this.__excp(12, { path: tip, ancestor: meta.distinctAncestor });
        }
        if (_includes(_takeRight(p, p.length - nidx), tip))
          this.__excp(16, { path: p });
      });
    } // end of distincty town

    if (p.length === 1) {
      this.__dataMap.set(this.root_node_id, datum);
      return _castArray(this.root_node_id);
    }

    // set intermediate nodes
    _forEach(p, (v, i) => {
      let k = this.__p2s(_take(p, i + 1));
      if (!this.__dataMap.has(k)) this.__dataMap.set(k, undefined);
    });

    this.__dataMap.set(this.__p2s(p), datum);
    // might we end up setting an insertion order number/index/graph coords?
    return this.__p2228t(p);
  }

  /**
   * Tests whether at least one qualifying datum passes the test implemented by the provided function.
   * 
   * @param {Function} fn Optional.
   * Defaults to _.identity.
   * 
   * The function to apply to each node, which should return truthy or falsey.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @param {Boolean} inclusive Optional.
   * Defaults to False.
   * 
   * When True, the entry for the path itself will also be provided to the function.
   * 
   * @param {integer} depth Optional.
   * Defaults to the maximum depth of the tree.
   * 
   * An integer representing the maximum depth from the path.
   * 
   * @returns {Boolean} True when all datums in the tree pass the test implemented by the provided function, else False.
   * 
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  someOf(fn = _identity, path, inclusive = false, depth) {
    if (!this.has(path)) this.__excp(4, { path });
    const p = this.__derive(path);

    if (depth && !_isInteger(depth)) this.__excp(6);

    if (depth === 0 && !inclusive) this.__excp(7);

    const maxDepth = depth ? p.length + depth : this.depth;

    const target = this.__p2s(p);
    let fe = _filter([...this.__dataMap.entries()], ([sk, d]) => {
      const ak = this.__s2p(sk);
      if (!inclusive && sk === target) return false;
      return _startsWith(sk, target) && ak.length <= maxDepth;
    });
    fe = _.map(fe, ([k, v]) => [this.__p2228t(k), v]);

    return _some(fe, fn);
  }

  /**
   * Apply a function to each node in a path in a specified order.
   * 
   * @param {Function} fn Optional.
   * Defaults to _identity.
   * 
   * The function to apply to each node; receives an entry and tree as arguments.
   * 
   * MUST return a [path, datum] entry or undefined.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @param {enum} order Optional.
   * Defaults to "desc".
   * 
   * One of "asc"|"desc".
   * 
   * NOTE: "desc" means from the root towards descendents.
   * 
   * @throws order must be one of "asc, desc"
   * @throws node does not exist, use has?
   * @throws function provided must return undefined or an [path, datum] entry
   */
  traverse(fn = _identity, path, order = "desc") {
    if (!this.has(path)) this.__excp(4, { path });

    if (!_includes(["asc", "desc"], order)) this.__excp(17, { order });

    path = this.__derive(path);

    // get keys for each node
    let keys = _map(path, (v, idx) => _take(path, idx + 1));
    if (order === "asc") keys = _reverse(keys);

    _forEach(keys, (k) => {
      const sk = this.__p2s(k);
      const d = this.__dataMap.get(sk);
      let entry = [this.__p2228t(k), d];

      const ret = fn(entry, this);
      if (_isUndefined(ret)) return;
      // entry must be an entry (array with path & datum elements) or undefined
      if (!_isArray(ret) || ret.length <= 1) this.__excp(5);

      // we don't know what key we're getting back but we better have it
      let [p, v] = ret;
      if (!this.has(p)) this.__excp(4, { path: p });

      p = this.__derive(p);
      this.__dataMap.set(this.__p2s(p), v);
    });
  }

  /**
   * Provide a set of values which match a path's descendents, and optionally include the path's value.
   * 
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @param {Boolean} inclusive Optional.
   * Defaults to False.
   * 
   * When True, the entry entry for the path itself will be included.
   * 
   * @param {Boolean} nested Optional.
   * Defaults to False.
   * 
   * Defines how the output array is returned.
   * 
   * @param {Integer} depth Optional.
   * Defaults to the maximum depth of the tree.
   * 
   * An integer representing the maximum depth from the path.
   * 
   * @returns {Array}
   * 
   * When nested is False, returns an array of values.
   * 
   * When nested is True, returns a nested array of [value, descendents] entries.
   * 
   * NOTE: insertion order is NOT guaranteed.
   * 
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  valuesOf(path, inclusive = false, nested = false, depth) {
    const p = this.__derive(path);

    if (depth && !_isInteger(depth)) this.__excp(6);

    if (depth === 0 && !inclusive) this.__excp(7);

    const maxDepth = depth ? p.length + depth : this.depth;
    const target = this.__p2s(p);

    let fe = _filter([...this.__dataMap.entries()], ([sk, d]) => {
      const ak = this.__s2p(sk);
      if (!inclusive && sk === target) return false;
      return _startsWith(sk, target) && ak.length <= maxDepth;
    });

    if (!nested) return _map(fe, ([k, v]) => v);

    const nest = (values) => {
      return _map(values, ([tk, v]) => {
        const ak = this.__s2p(tk);
        const descendents = _filter(
          fe,
          ([k, v]) =>
            _startsWith(k, tk) && this.__s2p(k).length === ak.length + 1
        );
        return [v, descendents.length ? nest(descendents) : []];
      });
    };

    // minimum depth
    const mnd = _(fe)
      .map((key) => this.__s2p(key).length)
      .min();

    // base nodes. we won't sort so at least the top nodes will remain in insertion order
    const bn = _filter(fe, ([k, v]) => this.__s2p(k).length === mnd);
    return nest(bn);
  }

  /**
   * Internal method to convert paths into arrays when necessary.
   * 
   * @access private
   * @param {*} path Optional.
   * Must be a String, path_string_delimiter delimited String, or Array.
   * 
   * When undefined, blank, or empty, the root node's path will be utilized.
   * 
   * @returns {Array} The full path to the node.
   * 
   * @throws path must be an array or a string
   * @throws elements in a path cannot be empty strings
   */
  __derive(path = []) {
    if (!_isArray(path) && !_isString(path)) this.__excp(1);

    if (!path.length)
      // an empty string or empty array means the root node path
      return this.rootNodePath;

    if (_isString(path)) path = this.__s2p(path);

    // no element in a path can be an empty string
    if (_some(path, (p) => p.length === 0)) this.__excp(2);

    if (_isEqual(path, this.rootNodePath)) return path;

    // internally, the path of a node MUST always begin with the root node path
    path = _isEqual([_head(path)], this.rootNodePath)
      ? path // root node path is already there
      : _concat(this.rootNodePath, path);

    // when the node entry exists, return it.
    if (this.__dataMap.has(this.__p2s(path))) return path;

    // when path length is 2 (root + path) they might want a descendent
    if (this.distinct && path.length === 2) {
      const np = _find(
        [...this.__dataMap.keys()],
        (k) => _last(this.__s2p(k)) === _last(path)
      );
      if (np && !_isEmpty(np)) path = this.__s2p(np);
    }

    return path;
  }

  /**
   * Internal method to throw a defined exception.
   * 
   * @access private
   * @param {integer} id Required.
   * 
   * The id of the message.
   */
  __excp(id, opts = {}) {
    const m = {
      1: `path must be an array or a string`,
      2: `elements in a path cannot be empty strings`,
      3: `show_root must be one of: 'yes', 'no', or 'auto`,
      4: `path ${opts.path} does not exist, use has?`,
      5: `function provided must return a node entry`,
      6: `depth must be an integer`,
      7: `depth cannot be zero when inclusive is false`,
      8: `no ancestor exists for ${opts.path}`,
      9: `non distinct trees cannot be merged into distinct trees`,
      10: `ancestor must be a simple string or single element array`,
      11: `ancestor ${opts.ancestor} cannot be used on non-distinct trees, full node id path for ${opts.path} is required`,
      12: `path ${opts.path} already exists in this distinct tree with ancestor ${opts.ancestor}`,
      14: `path must be a simple string, received ${opts.path}, ${opts.datum}, ${opts.ancestor}`,
      15: `ancestor ${opts.ancestor} does not exist`,
      16: `elements in path ${opts.path} cannot be duplicated with distinct trees`,
      17: `order must be one of "asc, desc", was ${opts.order}`,
      42: `all persons more than a mile high to leave the court`
    };
    const e = id in m ? m[id] : "invalid exception";
    throw new Error(e);
  }

  /**
   * Internal method to determine if the root node has a data reference.
   * 
   * @access private
   * @returns {Boolean} When the root datum is not undefined returns True, else False.
   */
  __hasRootDatum() {
    if (!this.__dataMap.has(this.root_node_id)) return false;
    if (this.__dataMap.get(this.root_node_id) === undefined) return false;
    return true;
  }

  /**
   * Internal method to provide basic metadata about a node.
   * 
   * @access private
   * @param {Array} path Required.
   * 
   * A full node id path array.
   */
  __meta(path = []) {
    if (!_isArray(path) || path.length === 0) this.__excp(1);

    const depth = _tail(path).length;
    const hasParent = depth > 0;
    const parentPath = _take(path, depth);
    const distinctAncestor = this.distinct
      ? hasParent
        ? _last(parentPath)
        : undefined
      : null;
    return {
      depth,
      distinctAncestor,
      hasParent,
      parentPath
    };
  }

  /**
   * Internal method to convert an array to a delimited string.
   * 
   * @access private
   * @param {Array} path Optional.
   * 
   * Defaults to an empty array.
   * 
   * @returns {String} path_string_delimiter delimited string.
   */
  __p2s(path = []) {
    return _join(path, this.path_string_delimiter);
  }

  /**
   * Internal method to provide the correct path expression based on Tree properties.
   * 
   * @access private
   * @param {*} path Optional.
   * Defaults to an empty array.
   * 
   * A string or an Array of strings.
   * 
   * @returns a single node id or a node id path
   */
  __p2228t(path = []) {
    // probably unnecessary guard
    if (!_isArray(path) && !_isString(path)) this.__excp(1);
    let p = _isString(path) ? this.__s2p(path) : path;
    const tip = _last(p);
    const show =
      this.show_root === "auto"
        ? !!this.__dataMap.get(this.root_node_id)
        : this.show_root === "yes";

    return this.distinct ? tip : show ? p : p.length === 1 ? [] : _tail(p);
  }

  /**
   * Internal method to convert a path_string_delimiter delimited string to an array.
   * 
   * @access private
   * @param {String} pathString Optional.
   * Defaults to an empty string.
   */
  __s2p(pathString = "") {
    return _split(pathString, this.path_string_delimiter);
  }
}
