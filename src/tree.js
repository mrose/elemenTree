import _ from 'lodash';
import _castArray from 'lodash/castArray';
import _concat from 'lodash/concat';
import _every from 'lodash/every';
import _filter from 'lodash/filter';
import _find from 'lodash/find';
import _forEach from 'lodash/forEach';
import _head from 'lodash/head';
import _identity from 'lodash/identity';
import _includes from 'lodash/includes';
import _isArray from 'lodash/isArray';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _isInteger from 'lodash/isInteger';
import _isString from 'lodash/isString';
import _isUndefined from 'lodash/isUndefined';
import _join from 'lodash/join';
import _last from 'lodash/last';
import _map from 'lodash/map';
import _reverse from 'lodash/reverse';
import _some from 'lodash/some';
import _split from 'lodash/split';
import _startsWith from 'lodash/startsWith';
import _tail from 'lodash/tail';
import _take from 'lodash/take';

// cmon why no static props?
const ROOT_NODE_ID = 'root';
const PATH_STRING_DELIMITER = '|';

/**
 * @classdesc Class representing a tree.
 * paths provided to the tree must strings or arrays of strings
 * paths are not required to include the root node id
 *
 *
 * roadmap:
 * depth can be zero when inclusive is true
 * add test for @throws "path already exists in this distinct tree"
 * when root datum is undefined, returns should not include root & vice versa
 * when distinct = true, should get() return just the tip? or assure all returns of paths are arrays
 * merge()
 * entries(path), keys(path), & values(path) return non-nested iterators
 * treeUtils?
 * predecessor not ancestor?
 *
 * some note about derived paths and unique node ids
 *
 */
export class Tree {
  /**
   *
   * @param {*} datum optional, defaults to undefined
   * the data associated with the root node
   * @param {string} root_node_id optional, defaults to "root"
   * the name used for the root node
   * n.b. The root_node_id is set in the constructor and cannot be reset.
   * @param {string} path_string_delimiter, optional, defaults to a pipe "|"
   * the internal delimiter for paths ("|")
   * n.b. The path_string_delimiter is set in the constructor and cannot be reset.
   * @param {map} dataMap optional, defaults to a Map
   * internal storage for the tree
   * @param {boolean} distinct optional, defaults to true
   * "homogenous" trees have distinct node ids which are never duplicated
   * when homogenous, distinct should be true and the ancestor attribute is enabled in the set method
   * when distinct the tree can find nodes by node id alone.
   * "heterogenous" trees may have the same node id appear in more than one place in the tree structure
   * when heterogenout, distinct should be false and the ancestor attribute is disabled in the set method
   * which means that nodes must be provided and referred to with full node id paths
   * i.e. a string which does not contain the path_string_delimiter or a single element array
   *
   * n.b. The path_string_delimiter, root_node_id, and distinct properties are set in the constructor and cannot be reset.
   */
  constructor(
    datum,
    root_node_id = ROOT_NODE_ID,
    path_string_delimiter = PATH_STRING_DELIMITER,
    dataMap,
    distinct = true,
  ) {
    Object.defineProperty(this, 'path_string_delimiter', {
      configurable: false,
      enumerable: true,
      value: path_string_delimiter,
      writable: false,
    });
    Object.defineProperty(this, 'root_node_id', {
      configurable: false,
      enumerable: true,
      value: root_node_id,
      writable: false,
    });
    Object.defineProperty(this, 'distinct', {
      configurable: false,
      enumerable: true,
      value: distinct,
      writable: false,
    });

    this.__dataMap = dataMap || new Map(); //key = path[], value = {data} thar be data
    this.__dataMap.set(root_node_id, datum);
  }

  /**
   * Create a new Tree, the factory method is preferred instead of directly using the constructor
   * @static
   * @param {object} optional, see contstructor for object contents
   */
  static factory({
    datum,
    root_node_id,
    path_string_delimiter,
    dataMap,
    distinct,
  } = {}) {
    return new Tree(
      datum,
      root_node_id,
      path_string_delimiter,
      dataMap,
      distinct,
    );
  }

  /**
   * @returns {number} including the root, the count of nodes in the longest path
   * @readonly
   */
  get depth() {
    return _([...this.__dataMap.keys()])
      .map((key) => this.__s2p(key).length)
      .max();
  }

  /**
   * @readonly
   * @returns {boolean} true when a node other than the root node exists else false
   */
  get hasDescendents() {
    return this.__dataMap.size > 1;
  }

  get rootNodePath() {
    return _castArray(this.root_node_id);
  }

  /**
   * count of nodes, including the root node
   * @readonly
   * @returns {number}
   */
  get size() {
    return this.__dataMap.size;
  }

  /**
   *
   * apply a function to a node's descendents, and optionally to the node
   * the order of application is NOT guaranteed
   * @param {function} fn optional, defaults to _.identity,
   * function to apply to each node
   * receives an entry and tree as arguments
   * MUST return a [path, datum] entry or undefined
   * @param {*} path, optional
   * must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @param {boolean} inclusive optional
   * defaults to false
   * when true, the entry for the path itself will also be provided to the function
   * @returns {object} an empty object you can use as a thenable
   * @throws node does not exist, use has?
   * @throws function provided must return undefined or an [path, datum] entry
   */
  cascade(fn = _identity, path, inclusive = false) {
    if (!this.has(path))
      throw new Error(`node ${path} does not exist, use has?`);
    path = this.__derive(path);

    const target = this.__p2s(path);
    let entries = _filter([...this.__dataMap.entries()], ([sk, d]) => {
      if (!inclusive && sk === target) return false;
      return _startsWith(sk, target);
    });

    _forEach(entries, (entry) => {
      const [esk, ev] = entry;
      const ret = fn([this.__s2p(esk), ev], this);
      if (_isUndefined(ret)) return;
      // entry must be an entry (array with path & datum elements) or undefined
      if (!_isArray(ret) || ret.length <= 1)
        throw new Error(`function provided must return an entry`);
      // we don't know what key we're getting back but we better have it
      let [p, v] = ret;

      if (!this.has(p)) throw new Error(`node ${p} does not exist, use has?`);

      p = this.__derive(p);
      this.__dataMap.set(this.__p2s(p), v);
    });
    return {}; // for promise implementations
  }

  /**
   * clear all nodes and datums
   * @returns {void}
   */
  clear() {
    this.__dataMap.clear();
    this.__dataMap.set(this.root_node_id, undefined);
  }

  /**
   * remove a node and the nodes below it
   * @param {*} path, optional, must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @param {boolean} inclusive optional, defaults to true
   *  the entry for the path itself will be included in the group to be deleted
   * @return {boolean} true when the node(s) to be removed exist(s)
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
   * @param {*} path, optional, must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @param {boolean} inclusive optional, defaults to false
   *  the entry entry for the path itself will be included
   * @param {boolean} nested optional, defaults to false
   * defines how the output array is returned
   * @param {integer} depth optional, defaults to the maximum depth of the tree
   * an integer representing the maximum depth from the path
   * @returns {array}
   * when nested is false returns an array of [key, datum] entries
   * when nested is true returns a nested array of [key, datum, descendents] entries
   * keys will be returned as node ids when the distinct property of the tree is true
   * NOTE: insertion order is NOT guaranteed
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */

  entriesOf(path, inclusive = false, nested = false, depth) {
    const p = this.__derive(path);

    if (depth && !_isInteger(depth))
      throw new Error('depth must be an integer');

    if (depth === 0 && !inclusive)
      throw new Error('depth cannot be zero when inclusive is false');

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
            _startsWith(k, tk) && this.__s2p(k).length === ak.length + 1,
        );
        return [
          this.__p2228t(tk),
          v,
          descendents.length ? nest(descendents) : [],
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
   * tests whether all qualifying entries pass the test implemented by the provided function
   * WARNING: This method returns true when the qualifiying entries are an empty array
   * @param {function} fn optional, defaults to _.identity
   * function to apply to each node
   * should return truthy or falsey
   * @param {*} path, optional
   * must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @param {boolean} inclusive optional
   * defaults to false
   * when true, the entry for the path itself will also be provided to the function
   * @param {integer} depth optional, defaults to the maximum depth of the tree
   * an integer representing the maximum depth from the path
   * @returns {boolean} true when all qualifying entries pass the test implemented by the provided function, else false
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  everyOf(fn = _identity, path, inclusive = false, depth) {
    if (!this.has(path))
      throw new Error(`node ${path} does not exist, use has?`);
    const p = this.__derive(path);

    if (depth && !_isInteger(depth))
      throw new Error('depth must be an integer');

    if (depth === 0 && !inclusive)
      throw new Error('depth cannot be zero when inclusive is false');

    const maxDepth = depth ? p.length + depth : this.depth;

    const target = this.__p2s(p);
    let fe = _filter([...this.__dataMap.entries()], ([sk, d]) => {
      const ak = this.__s2p(sk);
      if (!inclusive && sk === target) return false;
      return _startsWith(sk, target) && ak.length <= maxDepth;
    });

    return _every(fe, fn);
  }

  /**
   * @param {*} path, optional, must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be used.
   * @returns {array}
   * a flat array of [key, datum] entries for the immediate descendents ot the key requested
   * NOTE: insertion order is not guaranteed
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
   * get a node's value
   * @param {*} path, optional, must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @returns the node at the path
   * @throws path must be an array or string
   * @throws node does not exist, use has()?
   * for the moment you always get the full node id path back even if disinct
   */
  get(path) {
    if (!this.has(path)) throw new Error(`node does not exist, use has()?`);
    const p = this.__derive(path);
    const v = this.__dataMap.get(this.__p2s(p));
    return [p, v];
  }

  /**
   * @param {*} path optional, an array or delimited string, defaults to the root path
   * @returns {boolean} true when the datum for a node exists for the derived path (including undefined), otherwise false
   * @throws path must be an array or string
   */
  has(path) {
    const p = this.__derive(path);
    return this.__dataMap.has(this.__p2s(p));
  }

  /**
   * @param {*} path, optional, must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @param {boolean} inclusive optional, defaults to false
   *  the entry entry for the path itself will be included
   * @param {boolean} nested optional, defaults to false
   * defines how the output array is returned
   * @param {integer} depth optional, defaults to the maximum depth of the tree
   * an integer representing the maximum depth of elements qualifying for return
   * @returns {array}
   * when nested is false returns an array of [key] entries
   * when nested is true returns a nested array of [key, descendents] entries
   * keys will be returned as node ids when the distinct property of the tree is true
   * NOTE: insertion order is NOT guaranteed
   * @throws path must be an array or a string
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  keysOf(path, inclusive = false, nested = false, depth) {
    const p = this.__derive(path);

    if (depth && !_isInteger(depth))
      throw new Error('depth must be an integer');

    if (depth === 0 && !inclusive)
      throw new Error('depth cannot be zero when inclusive is false');

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
          (k) => _startsWith(k, tk) && this.__s2p(k).length === ak.length + 1,
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
   * append or update a datum at the path provided
   * intermediate nodes which do not exist will be provided a datum of undefined
   * when providing an ancestor, the node will be attached to the FIRST node matching that ancestor
   * @param {*} path, optional, must be a string, delimited string, array. The root node's datum will be set when a path is not provided.
   * @param {*} datum, optional, value to be associated with the path, defaults to undefined
   * @param {string} ancestor, optional, must be a string, delimited string, or array. Ignored when the path is not provided.
   * @returns {array} the path assigned to the datum
   * @throws "path must be a simple string" when the ancestor provided is not a simple string
   * @throws "ancestor does not exist" when the ancestor is provided is not in the tree
   * @throws "ancestor cannot be used on distinct trees, full node id paths are required"
   * @throws "ancestor must be a simple string or single element array"
   * @throws "path already exists in this distinct tree"
   */
  set(path, datum = undefined, ancestor) {
    let p = path;
    p = this.__derive(p);

    if (ancestor && !this.distinct)
      throw new Error(
        `ancestor "${ancestor}" cannot be used on non-distinct trees, full node id path for "${path}" is required`,
      );

    if (ancestor && p.length) {
      if (p.length > 2)
        if (this.distinct) {
          throw new Error(`path ${path} already exists in this distinct tree`);
        } else {
          throw new Error(
            `path must be a simple string, received ${path}, ${datum}, ${ancestor}`,
          );
        }

      let d = _isString(ancestor) ? this.__s2p(ancestor) : ancestor;
      if (d.length > 1)
        throw new Error(
          `ancestor must be a simple string or single element array`,
        );
      d = this.__derive(ancestor);

      if (!_head(d).length)
        throw new Error(`ancestor ${ancestor} does not exist`);
      p = _concat(d, _tail(p));
    }

    if (p.length === 1) {
      this.__dataMap.set(this.root_node_id, datum);
      return _castArray(this.root_node_id);
    }
    if (p.length < 2) return; //throw new Error('nothing to set');

    this.__setIntermediates(p);
    this.__dataMap.set(this.__p2s(p), datum);
    // we might end up setting an insertion order number/index?
    return p;
  }

  /**
   * tests whether at least one qualifying datum passes the test implemented by the provided function
   * @param {function} fn optional, defaults to _.identity
   * function to apply to each node
   * should return truthy or falsey
   * @param {*} path, optional
   * must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @param {boolean} inclusive optional
   * defaults to false
   * when true, the entry for the path itself will also be provided to the function
   * @param {integer} depth optional, defaults to the maximum depth of the tree
   * an integer representing the maximum depth from the path
   * @returns {boolean} true when all datums in the tree pass the test implemented by the provided function, else false
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  someOf(fn = _identity, path, inclusive = false, depth) {
    if (!this.has(path))
      throw new Error(`node ${path} does not exist, use has?`);
    const p = this.__derive(path);

    if (depth && !_isInteger(depth))
      throw new Error('depth must be an integer');

    if (depth === 0 && !inclusive)
      throw new Error('depth cannot be zero when inclusive is false');

    const maxDepth = depth ? p.length + depth : this.depth;

    const target = this.__p2s(p);
    let fe = _filter([...this.__dataMap.entries()], ([sk, d]) => {
      const ak = this.__s2p(sk);
      if (!inclusive && sk === target) return false;
      return _startsWith(sk, target) && ak.length <= maxDepth;
    });

    return _some(fe, fn);
  }

  /**
   * apply a function to nodes in a path in order
   * @param {function} fn optional, defaults to _identity
   * function to apply to each node
   * receives an entry and tree as arguments
   * MUST return a [path, datum] entry or undefined
   * @param {*} path, optional
   * must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @param {enum} order optional. one of "asc"|"desc" desc means from the root towards descendents. defaults to 'desc'
   * @throws order must be one of "asc, desc"
   * @throws node does not exist, use has?
   * @throws function provided must return undefined or an [path, datum] entry
   */
  traverse(fn = _identity, path, order = 'desc') {
    if (!this.has(path))
      throw new Error(`node ${path} does not exist, use has?`);

    if (!_includes(['asc', 'desc'], order))
      throw new Error(`order must be one of "asc, desc", was ${order}`);

    path = this.__derive(path);

    // get keys for each node
    let keys = _map(path, (v, idx) => _take(path, idx + 1));
    if (order === 'asc') keys = _reverse(keys);

    _forEach(keys, (k) => {
      const sk = this.__p2s(k);
      const d = this.__dataMap.get(sk);
      let entry = [k, d];

      const ret = fn(entry, this);
      if (_isUndefined(ret)) return;
      // entry must be an entry (array with path & datum elements) or undefined
      if (!_isArray(ret) || ret.length <= 1)
        throw new Error(`function provided must return an entry`);
      // we don't know what key we're getting back but we better have it
      let [p, v] = ret;

      if (!this.has(p)) throw new Error(`node ${p} does not exist, use has?`);

      p = this.__derive(p);
      this.__dataMap.set(this.__p2s(p), v);
    });
    return {}; // for promise implementations
  }

  /**
   * @param {*} path, optional, must be a string, delimited string or array.
   * when undefined, blank, or empty, the root node's path will be utilized.
   * @param {boolean} inclusive optional, defaults to false
   *  the entry entry for the path itself will be included
   * @param {boolean} nested optional, defaults to false
   * defines how the output array is returned
   * @param {integer} depth optional, defaults to the maximum depth of the tree
   * an integer representing the maximum depth from the path
   * @returns {array}
   * when nested is false returns an array of [key, datum] entries
   * when nested is true returns a nested array of [key, datum, descendents] entries
   * NOTE: (insertion order is NOT guaranteed.
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  valuesOf(path, inclusive = false, nested = false, depth) {
    const p = this.__derive(path);

    if (depth && !_isInteger(depth))
      throw new Error('depth must be an integer');

    if (depth === 0 && !inclusive)
      throw new Error('depth cannot be zero when inclusive is false');

    const maxDepth = depth ? p.length + depth : this.depth;
    const target = this.__p2s(p);

    let fe = _filter([...this.__dataMap.entries()], ([k, v]) => {
      const ak = this.__s2p(k);
      if (!inclusive && k === target) return false;
      return _startsWith(k, target) && ak.length <= maxDepth;
    });

    if (!nested) return _map(fe, ([k, v]) => v);

    const nest = (values) => {
      return _map(values, ([tk, v]) => {
        const ak = this.__s2p(tk);
        const descendents = _filter(
          fe,
          ([k, v]) =>
            _startsWith(k, tk) && this.__s2p(k).length === ak.length + 1,
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
   * internal method to convert paths into arrays if necessary
   * @access private
   * @param {*} path, optional, must be a delimited string or array
   * @returns {array} the full path to the node
   * @throws path must be an array or a string
   */
  __derive(path = []) {
    if (!_isArray(path) && !_isString(path))
      throw new Error('path must be an array or a string');

    // an empty string or array means the root node path
    if (!path.length) return this.rootNodePath;

    if (_isString(path)) path = this.__s2p(path);
    if (_isEqual(path, this.rootNodePath)) return path;

    // internally, the path of a node MUST always begin with the root node path
    path = _isEqual([_head(path)], this.rootNodePath)
      ? path // root node path is already there
      : _concat(this.rootNodePath, path);

    // if the node entry exists, return it.
    if (this.__dataMap.has(this.__p2s(path))) return path;

    // if path length is 2 (root + path) they might want a descendent
    if (this.distinct && path.length === 2) {
      const np = _find(
        [...this.__dataMap.keys()],
        (k) => _last(this.__s2p(k)) === _last(path),
      );
      if (np && !_isEmpty(np)) path = this.__s2p(np);
    }

    return path;
  }

  /**
   * @returns {boolean} true when the root datum is not undefined, else false
   */
  __hasRootDatum() {
    if (!this.__dataMap.has(this.root_node_id)) return false;
    if (this.__dataMap.get(this.root_node_id) === undefined) return false;
    return true;
  }

  /**
   * convert an array to a delimited string
   * @access private
   * @param {array} path
   */
  __p2s(path = []) {
    return _join(path, this.path_string_delimiter);
  }

  /**
   *
   * @param {*} path
   * @returns a single node id or a path or node ids
   */
  __p2228t(path = []) {
    // probably unnecessary guard
    if (!_isArray(path) && !_isString(path))
      throw new Error('path must be an array or a string');

    const p = _isString(path) ? this.__s2p(path) : path;

    return this.distinct ? _last(p) : p;
  }

  /**
   * convert a delimited string to an array
   * @access private
   * @param {string} pathString (delimited)
   */
  __s2p(pathString = '') {
    return _split(pathString, this.path_string_delimiter);
  }

  /**
   * assure that all nodes within a path exist
   * @access private
   * @param {array} path, required
   * n.b since __setIntermediates is a recursive function path coercion,
   * if required, must precede
   * @throws path is not an array
   */
  __setIntermediates(path) {
    if (!_isArray(path)) throw new Error('path must be an array');
    _forEach(path, (v, i) => {
      let k = this.__p2s(_take(path, i + 1));
      if (!this.__dataMap.has(k)) this.__dataMap.set(k, undefined);
    });
  }
}
