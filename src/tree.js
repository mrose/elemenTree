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
import _isNil from 'lodash/isNil';
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
import _takeRight from 'lodash/takeRight';

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
 * getAncestor()
 * merge()
 * when root datum is undefined, returns should not include root & vice versa
 * when distinct = true, should returned paths like get() return just the tip? or assure all returns of paths are arrays
 * entries(path), keys(path), & values(path) return non-nested iterators
 * treeUtils /flow
 * update tests
 * update documentation, incl some note about derived paths and unique node ids
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
   * when the path argument is a node id path array, intermediate nodes which do not exist will be provided a datum of undefined
   * trees whose distinct property is false cannot use the ancestor argument
   * @param {*} path, optional, must be a string, delimited string, array. The root node's datum will be set when a path is not provided.
   * @param {*} datum, optional, value to be associated with the path, defaults to undefined
   * @param {string} ancestor, optional, must be a string, delimited string, or array. Ignored when the path is not provided.
   * @returns {array} the path assigned to the datum
   * @throws "path must be a simple string" when the ancestor provided is not a simple string
   * @throws "elements in a path cannot be empty strings""
   * @throws "ancestor does not exist" when the ancestor is provided is not in the tree
   * @throws "ancestor cannot be used on distinct trees, full node id paths are required"
   * @throws "ancestor must be a simple string or single element array"
   * @throws "path already exists in this distinct tree"
   * @throws "elements in a path cannot be duplicated with distinct trees"
   */
  set(path, datum = undefined, ancestor = undefined) {
    let d,
      p = path;
    p = this.__derive(p);
    let exists = this.__dataMap.has(this.__p2s(p));
    let meta = this.__meta(p);

    if (!_isNil(ancestor)) {
      if (this.distinct) {
        if (!_isString(ancestor) && !_isArray(ancestor)) {
          throw new Error(
            `ancestor must be a simple string or single element array`,
          );
        }

        d = _isString(ancestor) ? _castArray(ancestor) : ancestor;
        if (d.length > 1) {
          throw new Error(
            `ancestor must be a simple string or single element array`,
          );
        }
      } else {
        throw new Error(
          `ancestor "${ancestor}" cannot be used on non-distinct trees, full node id path for "${path}" is required`,
        );
      }
    }

    if (this.distinct) {
      if (!_isNil(ancestor)) {
        if (exists) {
          // no duplicate node id!
          d = _isString(ancestor) ? _castArray(ancestor) : ancestor;
          const ta = this.__p2s(d);

          if (ta !== meta.distinctAncestor) {
            throw new Error(
              `path ${path} already exists in this distinct tree with ancestor ${ta}`,
            );
          }

          // is it update
          this.__dataMap.set(this.__p2s(p), datum);
          return p;
        }

        // i.e. root + something
        if (p.length > 2) {
          throw new Error(
            `path must be a simple string, received ${path}, ${datum}, ${ancestor}`,
          );
        }

        // do ancestry now
        d = this.__derive(ancestor);
        if (!this.__dataMap.has(this.__p2s(d)))
          throw new Error(`ancestor ${ancestor} does not exist`);

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
          throw new Error(
            `path ${tip} already exists in this distinct tree with ancestor ${meta.distinctAncestor}`,
          );
        }
        if (_includes(_takeRight(p, p.length - nidx), tip))
          throw new Error(
            `elements in path ${p} cannot be duplicated with distinct trees`,
          );
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
    // we might end up setting an insertion order number/index/graph coords?
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
   * @throws elements in a path cannot be empty strings
   */
  __derive(path = []) {
    if (!_isArray(path) && !_isString(path))
      throw new Error('path must be an array or a string');

    if (!path.length)
      // an empty string or empty array means the root node path
      return this.rootNodePath;

    if (_isString(path)) path = this.__s2p(path);

    // no element in a path can be an empty string
    if (_some(path, (p) => p.length === 0)) {
      throw new Error(`elements in a path cannot be empty strings`);
    }

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
   * provide basic metadata for a node
   * @param {array} path a full node path array
   */
  __meta(path = []) {
    if (!_isArray(path) || path.length === 0)
      throw new Error('path must be an array or a string');

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
      parentPath,
    };
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
