import add from "lodash/fp/add";
import castArray from "lodash/fp/castArray";
import concat from "lodash/fp/concat";
import countBy from "lodash/fp/countBy";
import curry from "lodash/fp/curry";
import every from "lodash/fp/every";
import filter from "lodash/fp/filter";
import find from "lodash/fp/find";
import flow from "lodash/fp/flow";
import forEach from "lodash/fp/forEach";
import head from "lodash/fp/head";
import identity from "lodash/fp/identity";
import includes from "lodash/fp/includes";
import isArray from "lodash/fp/isArray";
import isEmpty from "lodash/fp/isEmpty";
import isEqual from "lodash/fp/isEqual";
import isFunction from "lodash/fp/isFunction";
import isInteger from "lodash/fp/isInteger";
import isNil from "lodash/fp/isNil";
import isString from "lodash/fp/isString";
import isUndefined from "lodash/fp/isUndefined";
import join from "lodash/fp/join";
import last from "lodash/fp/last";
import map from "lodash/fp/map";
import max from "lodash/fp/max";
import min from "lodash/fp/min";
import noop from "lodash/fp/noop";
import partition from "lodash/fp/partition";
import pick from "lodash/fp/pick";
import reduce from "lodash/fp/reduce";
import reverse from "lodash/fp/reverse";
import size from "lodash/fp/size";
import some from "lodash/fp/some";
import split from "lodash/fp/split";
import startsWith from "lodash/fp/startsWith";
import stubTrue from "lodash/fp/stubTrue";
import tail from "lodash/fp/tail";
import take from "lodash/fp/take";
import times from "lodash/fp/times";
import values from "lodash/fp/values";

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

  static ROOT_NODE_ID = 'root';
  static PATH_STRING_DELIMITER = '|';

  /**
   * The pathStringDelimiter, rootNodeId, and distinct properties are set in the constructor and cannot be reset.
   *
   * For parameter details see the static Factory method.
   *
   * @param {*} datum Optional.
   * Defaults to undefined.
   *
   * @param {String} rootNodeId Optional.
   * Defaults to "root".
   *
   * @param {String} pathStringDelimiter Optional.
   * Defaults to a pipe '|'.
   *
   * @param {Map} dataMap Optional.
   * Defaults to a Map.
   *
   * @param {Boolean} distinct Optional.
   * Defaults to True.
   *
   * @param {String} showRoot Optional.
   * Defaults to 'auto'.
   *
   * @throws showRoot must be one of: 'yes', 'no', or 'auto'.
   */
  constructor(
    datum,
    rootNodeId = Tree.ROOT_NODE_ID,
    pathStringDelimiter = Tree.PATH_STRING_DELIMITER,
    dataMap,
    distinct = true,
    showRoot = "auto" // yes | no | auto
  ) {
    //    Object.defineProperty(this, 'pathStringDelimiter', {
    //      get: function() {
    //        return pathStringDelimiter;
    //      }
    //    });
    Object.defineProperty(this, "pathStringDelimiter", {
      configurable: false,
      enumerable: true,
      value: pathStringDelimiter,
      writable: false,
    });
    Object.defineProperty(this, "rootNodeId", {
      configurable: false,
      enumerable: true,
      value: rootNodeId,
      writable: false,
    });
    Object.defineProperty(this, "distinct", {
      configurable: false,
      enumerable: true,
      value: distinct,
      writable: false,
    });

    this._dataMap = dataMap || new Map(); //key = path[], value = {data} thar be data
    this._dataMap.set(rootNodeId, datum);
    if (showRoot) this.showRoot = validate(3, { showRoot });
  }

  /**
   * @typedef {Object} FactoryOptions
   * @param {*} datum Optional.
   * Defaults to undefined.
   *
   * The data associated with the root node.
   *
   * @property {String} rootNodeId Optional.
   * Defaults to "root".
   *
   * The name used for the root node.
   *
   * n.b. The rootNodeId is set in the constructor and cannot be reset.
   *
   * @property {String} pathStringDelimiter, Optional.
   * Defaults to a pipe "|".
   *
   * The internal delimiter for paths ("|").
   *
   * n.b. The pathStringDelimiter is set in the constructor and cannot be reset.
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
   * A node id must always be a string which does not contain the pathStringDelimiter, or a single element array.
   * Distinct trees never use node id paths.
   *
   * Non distinct trees may have the same node id appear in more than one place in the tree structure.
   * When distinct is false the ancestor attribute is disallowed in the set method.
   * Because node ids may appears in multiple places, keys must be full node id paths.
   *
   * @property {String} showRoot Optional
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
    rootNodeId,
    pathStringDelimiter,
    dataMap,
    distinct,
    showRoot,
  } = {}) {
    return new Tree(
      datum,
      rootNodeId,
      pathStringDelimiter,
      dataMap,
      distinct,
      showRoot
    );
  }

  /**
   * @readonly
   * @returns {Number} The count of nodes in the longest path, including the root.
   */
  get depth() {
    const { _dataMap, pathStringDelimiter } = this;
    return flow(
      map((key) => s2p(this)(key).length),
      max
    )([..._dataMap.keys()]);
  }

  /**
   * @readonly
   * @returns {Boolean} True when a node other than the root node exists, else False.
   */
  get hasDescendents() {
    return this._dataMap.size > 1;
  }

  /**
   * @readonly
   * @returns {Boolean} True when the root datum is not undefined, else False.
   */
  get hasRootDatum() {
    if (!this._dataMap.has(this.rootNodeId)) return false;
    if (this._dataMap.get(this.rootNodeId) === undefined) return false;
    return true;
  }


  /**
   * @readonly
   * @returns {Array} The key to the root node as an Array.
   */
  get rootNodePath() {
    return castArray(this.rootNodeId);
  }

  /**
   * @readonly
   * @returns {Number} The number of nodes including the root node.
   */
  get size() {
    return this._dataMap.size;
  }

  /**
   * Apply a function to a node's descendents, and optionally to the node itself.
   *
   * NOTE: The order of application is NOT guaranteed.
   *
   * @param {Function} fn Optional.
   * Defaults to identity.
   *
   * The function to apply to each node; receives an entry and tree as arguments.
   * The function MUST return a [path, datum] entry or undefined.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
   *
   * When undefined, blank, or empty, the root node's path will be utilized.
   *
   * @param {Boolean} inclusive Optional.
   * Defaults to false.
   *
   * When true, the entry for the path itself will also be provided to the function.
   * @returns {Void}
   * @throws path does not exist, use has?
   * @throws function provided must return undefined or an [path, datum] entry
   */
  cascade(fn = identity, path, inclusive = false) {
    const tree = this;
    path = validate(4, { path, tree });

    forEach((entry) => {
      const [ek, ev] = entry;
      const ret = fn([ek, ev], tree);
      if (isUndefined(ret)) return;
      // entry must be an entry (array with path & datum elements) or undefined
      let [p, v] = validate(5, { ret });
      // we don't know what key we're getting back but we better have it
      p = validate(4, { path: p, tree });
      // TODO: use set()?
      this._dataMap.set(p2s(tree)(p), v);
    })(map(([k, v]) => ([p2228t(tree)(k), v]))(descendents(inclusive, undefined, tree, path)));
  }

  /**
   * Clear all nodes and datums.
   * @returns {Void}
   */
  clear() {
    const tree = this;
    tree._dataMap.clear();
    tree._dataMap.set(tree.rootNodeId, undefined);
  }

  /**
   * Remove a node and its descendents.
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.

   * When undefined, blank, or empty, the root node's path will be utilized.

   * @param {Boolean} inclusive Optional.
   * Defaults to true.

   * When true, the entry for the path itself will be included in the group to be deleted.

   * @return {Boolean} True when all removed node(s) existed, else False.
   */
  delete(path, inclusive = true) {
    const tree = this;
    const fe = descendents(inclusive, undefined, tree, path);
    if (!size(fe)) return false;
    // TODO: overEvery?
    return reduce((acc, [k, v]) => {
      return acc && tree._dataMap.delete(p2s(tree)(k));
    }, true,  fe);
  }

  /**
   * Provide a set of entries which match a path's descendents, and optionally include the path's entry.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
    const tree = this;
    const keyFormatter = p2228t(tree);
    const fe = descendents(inclusive, depth, tree, path);
    return (nested)
      ? nest(tree, keyFormatter, undefined, fe)
      : map(([k, v]) => [keyFormatter(k), v])(fe)
      ;
  }

  /**
   * Tests whether all qualifying entries pass the test implemented by the provided function.
   *
   * WARNING: When the qualifiying entries are an empty array this method returns True.

   * @param {Function} fn Optional.
   * Defaults to a function that always returns True.
   *
   * The function to apply to each node which should return truthy or falsey.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
   * @throws argument supplied must be a function
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
  everyOf(fn = stubTrue, path, inclusive = false, depth) {
    const tree = this;
    validate(4, { path, tree });
    validate(18, { fn });
    return every(fn, map(([k, v]) => [p2228t(tree)(k), v])(descendents(inclusive, depth, tree, path)));
  }

  /**
   * Provide a set of entries which match a path's immediate descendents.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
    const tree = this;
    return map(([k, v]) => [p2228t(tree)(k), v])(descendents(false, 1, tree, path));
  }

  /**
   * Get a node's value.
   *
   * NOTE: An exception is thrown when the path does not exist.
   *
   * In contrast to the Map api, an exception is thrown because the value of a node is allowed to be undefined.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
   *
   * When undefined, blank, or empty, the root node's path will be used.
   *
   * @returns The datum at the path.
   *
   * @throws path must be an array or string
   * @throws node does not exist, use has()?
   */
  get(path) {
    const tree = this;
    const fp = validate(4, { path, tree });
    return tree._dataMap.get(p2s(tree)(fp));
  }

  /**
   * Get a node's ancestor's value.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
    const tree = this;
    path = validate(4, { path, tree });
    const { rootNodeId } = tree;
    const { parentPath } = meta(tree)(path);
    validate(8, { path:rootNodeId, parentPath });
    return tree.get(parentPath);
  }

  /**
   * Check whether a node exists.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
   *
   * When undefined, blank, or empty, the root node's path will be utilized.
   *
   * @returns {Boolean} True when the datum for a node exists for the derived path (including undefined), else False.
   *
   * @throws path must be an array or string
   */
  has(path) {
    const tree = this;
    const p = deriveFullPath(tree)(path);
    return tree._dataMap.has(p2s(tree)(p));
  }

  /**
   * Provide a set of keys which match a path's descendents, and optionally include the path's key.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
    const tree = this;
    const keyFormatter = p2228t(tree);
    const fe = descendents(inclusive, depth, tree, path);
    return (nested)
      ? nest(tree, keyFormatter, 'keys', fe)
      : map(([k, v]) => keyFormatter(k))(fe)
      ;
  }

  /**
   * Merge a Tree into an existing target Tree.
   * @param {Tree} source
   * @throws non distinct trees cannot be merged into distinct trees
   */
  merge(source) {
    const tree = this;
    validate(9, {
      sourceDistinct: source.distinct,
      targetDistinct: tree.distinct,
    });

    const ies = source._dataMap.entries();
    flow(
      map(([k, v]) => [split(source.pathStringDelimiter, k), v]),
      forEach(([k, v]) => tree.set(k, v))
    )([...ies]);
  }

  /**
   * Append or update a datum at the path provided.
   *
   * NOTE: When the path argument is a node id path array, intermediate nodes which do not exist will be provided a datum of undefined.
   *
   * NOTE: The ancestor argument is invalid and therefore ignored for a Tree whose distinct property is false.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
   * Must be a String, pathStringDelimiter delimited String, or Array.
   *
   * @returns {Array} The path assigned to the datum.
   *
   * @throws path must be a simple string (when the ancestor provided is not a simple string)
   * @throws elements in a path cannot be empty strings
   * @throws ancestor does not exist (when the ancestor provided is not in the tree)
   * @throws ancestor argument cannot be used to set nodes on distinct trees, full node id paths are required
   * @throws ancestor must be a simple string or single element array
   * @throws path already exists in this distinct tree
   * @throws elements in a path cannot be duplicated with distinct trees
   */
  set(path, datum = undefined, ancestor = undefined) {
    let d;
    let p = deriveFullPath(this)(path);
    const { _dataMap, distinct, pathStringDelimiter, rootNodeId } = this;
    
    if (!isNil(ancestor)) {
      validate(11, { distinct, path });
      validate(10, { ancestor });
      // ancestor must exist when distinct
      if (distinct) validate(15, {ancestor, tree: this});
    }

    if (distinct) {
      if (!isNil(ancestor)) {
        // if it exists
        if (_dataMap.has(p2s(this)(p))) {
          // no duplicate node id!
          validate(121, { ancestor, path, pathStringDelimiter, tree: this });

          // is it update
          _dataMap.set(p2s(this)(p), datum);
          return p2228t(this)(p);
        }

        // i.e. root + something
        validate(14, { ancestor, datum, path, tree: this });
        p = concat(deriveFullPath(this)(ancestor), tail(p));
      }

      // check ancestry distinctyness
      // for the tip of each path, validate that the ancestor is correct
      const lineage = lineageForPath(p);
      forEach((p) => validate(122, {path:p, tree:this}), lineage);
      validate(16, { path: p});
    } // end of distincty town

    if (p.length === 1) {
      _dataMap.set(rootNodeId, datum);
      return castArray(rootNodeId);
    }

    // set intermediate nodes
    flow(
      filter((fp) => !_dataMap.has(p2s(this)(fp))),
      forEach((k) => _dataMap.set(p2s(this)(k), undefined))
    )(lineageForPath(p));

    _dataMap.set(p2s(this)(p), datum);
    // might we end up setting an insertion order number/index/graph coords?
    return p2228t(this)(p);
  }

  /**
   * Tests whether at least one qualifying datum passes the test implemented by the provided function.
   *
   * @param {Function} fn Optional.
   * Defaults to identity.
   *
   * The function to apply to each node, which should return truthy or falsey.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
   * @throws argument supplied must be a function
   * @throws path must be an array or a string
   * @throws node does not exist, use has?
   * @throws depth must be an integer
   * @throws depth cannot be zero when inclusive is false
   */
   someOf(fn = stubTrue, path, inclusive = false, depth) {
    const tree = this;
    validate(4, { path, tree });
    validate(18, { fn });
    return some(fn, map(([k, v]) => [p2228t(tree)(k), v])(descendents(inclusive, depth, tree, path)));
  }

  /**
   * Apply a function to each node in a path in a specified order.
   *
   * @param {Function} fn Optional.
   * Defaults to identity.
   *
   * The function to apply to each node; receives an entry and tree as arguments.
   *
   * MUST return a [path, datum] entry or undefined.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
  traverse(fn = identity, path, order = "desc") {
    path = validate(4, { path, tree: this });

    validate(17, { order });

    const { _dataMap } = this;
    const keys = (order === "asc") ? reverse(lineageForPath(path)) : lineageForPath(path);

    forEach((k) => {
      const sk = p2s(this)(k);
      const d = _dataMap.get(sk);
      let entry = [p2228t(this)(k), d];

      const ret = fn(entry, this);
      if (isUndefined(ret)) return;
      // entry must be an entry (array with path & datum elements) or undefined
      let [p, v] = validate(5, { ret });
      // we don't know what key we're getting back but we better have it
      p = validate(4, { path: p, tree: this });
      _dataMap.set(p2s(this)(p), v);
    }, keys);
  }

  /**
   * Provide a set of values which match a path's descendents, and optionally include the path's value.
   *
   * @param {*} path Optional.
   * Must be a String, pathStringDelimiter delimited String, or Array.
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
    validate(6, { depth });
    validate(7, { depth, inclusive });

    const tree = this;
    const fe = descendents(inclusive, depth, tree, path);
    return (nested)
      ? nest(tree, undefined, 'values', fe)
      : map(([k, v]) => v)(fe)
      ;
  }

}

// - - - - - - - - - - - supporting utils - - - - - - - - - - - //

/**
 * validate Tree requirements and throw a defined exception when invalid
 *
 * @param {Integer} id Required. The id of the validation.
 * @param {Object} key/value pairs needed for validation and message rendering.
 * 
 * @returns {*} In some cases returns something
 * @throws {Error} exception with formatted message.
 */
export function validate(id, opts = {}) {
  const c = {
    1: [
      ({ path }) => !isArray(path) && !isString(path),
      ({ path }) => `path must be an array or a string`,
      ({ path }) => path,
    ],
    2: [
      ({ path }) => some((p) => !isString, path) || some((p) => p.length === 0, path),
      ({ path }) => `path nodes must be non-empty strings`,
      ({ path }) => path,
    ],
    3: [
      ({ showRoot }) => !includes(showRoot, ["yes", "no", "auto"]),
      ({}) => `showRoot must be one of: 'yes', 'no', or 'auto`,
      ({ showRoot }) => showRoot,
    ],
    4: [
      ({ path, tree }) => !tree.has(path),
      ({ path, tree }) => `path ${path} does not exist, use has?`,
      ({path, tree}) => deriveFullPath(tree)(path),
    ],
    5: [
      ({ ret }) => !isArray(ret) || ret.length <= 1,
      ({ ret }) => `function provided must return a node entry`,
      ({ ret }) => ret,
    ],
    6: [
      ({ depth }) => depth && !isInteger(depth),
      ({ depth }) => `depth must be an integer`,
    ],
    7: [
      ({ depth, inclusive }) => depth < 1 && !inclusive,
      ({ depth, inclusive }) => `depth cannot be less than 1 when inclusive is false`,
    ],
    8: [
      ({ path, parentPath }) => isEmpty(parentPath),
      ({ path, parentPath }) => `no ancestor exists for ${path}`,
    ],
    9: [
      ({ sourceDistinct, targetDistinct }) => targetDistinct && !sourceDistinct,
      ({ sourceDistinct, targetDistinct }) =>
        `non distinct trees cannot be merged into distinct trees`,
    ],
    10: [
      ({ ancestor }) =>
        (!isString(ancestor) && !isArray(ancestor)) ||
        (isArray(ancestor) && ancestor.length > 1),
      ({ ancestor }) =>
        `ancestor must be a simple string or single element array`,
    ],
    11: [
      ({ distinct, path }) => !distinct,
      ({ distinct, path }) =>
        `the ancestor argument cannot be used to set nodes on non-distinct trees, full node id path for ${path} is required`,
    ],
    121: [
      ({ ancestor, path, pathStringDelimiter, tree }) => {
        // no duplicate node id!
        const p = deriveFullPath(tree)(path);
        const ta = p2s(tree)(isString(ancestor) ? castArray(ancestor) : ancestor);
        const { distinctAncestor } = meta(tree)(p);
        return ta !== distinctAncestor;
      },
      ({ ancestor, path, pathStringDelimiter, tree }) => {
        const p = deriveFullPath(tree)(path);
        const ta = p2s(tree)(isString(ancestor) ? castArray(ancestor) : ancestor);
        const { distinctAncestor } = meta(tree)(p);
        return `path ${ta} already exists in this distinct tree with ancestor ${distinctAncestor}`;
      },
    ],
    122: [
      ({path, tree}) => {
        // see if we can find an alternate path to the tip
        const np = deriveFullPath(tree)(last(path));
        // if it exists, it should match
        return (tree.has(np)) ? !isEqual(np, path): false;
      },
      ({path, tree}) => {
        const np = deriveFullPath(tree)(last(path));
        const ancestor = pick('distinctAncestor', meta(tree)(np));
        return `path ${last(path)} already exists in this distinct tree with ancestor ${ancestor}`;
      }
    ],
    14: [
      ({ path, datum, ancestor, tree }) => deriveFullPath(tree)(path).length > 2,
      ({ path, datum, ancestor, tree }) =>
        `path must be a simple string, received ${path}, ${datum}, ${ancestor}`,
    ],
    15: [
      ({ ancestor, tree }) => !tree.has(deriveFullPath(tree)(ancestor)),
      ({ ancestor, tree }) => `ancestor ${ancestor} does not exist`,
    ],
    16: [
      ({path}) => flow(
          countBy(identity),
          values(),
          some((n) => n > 1)
        )(path),
      ({path}) =>
        `elements in path ${path} cannot be duplicated with distinct trees`,
    ],
    17: [
      ({ order }) => !includes(order, ["asc", "desc"]),
      ({ order }) => `order must be one of "asc, desc", was ${order}`,
    ],
    18: [
      ({ fn }) => !isFunction(fn),
      () => `argument supplied must be a function`,
    ],
    19: [
      ({ only }) => !includes(only, ["keys", "values", undefined]),
      ({ only }) => `only must be one of "keys", "values, or undefined, was ${only}`,

    ],
    42: [
      stubTrue,
      () => `all persons more than a mile high to leave the court`,
    ],
    999: [stubTrue, () => `invalid or unknown exception`],
  };
  const [condition, error, ret = noop] = id in c ? c[id] : c[999];
//if (id == 15) console.log(`validate 15`, c[id]);  
  if (condition(opts)) throw new Error(error(opts));
  return ret(opts);
}

/**
 * curried function to derive full path arrays
 *
 * @param {Tree}
 * @returns {Function}
 *
 * @param {*} path Optional.
 * Defaults to an empty array.
 * 
 * Must be a String, pathStringDelimiter delimited String, or Array.
 *
 * When undefined, blank, or empty, the root node's path will be utilized.
 *
 * @returns {Array} The full path to the node.
 *
 * @throws path must be an array or a string
 * @throws elements in a path cannot be empty strings
 */
export function deriveFullPath(tree) {
  const { _dataMap, distinct, rootNodePath } = tree;
  return function (path = []) {
    validate(1, { path });

    // an empty string or empty array means the root node path
    if (!path.length) return rootNodePath;

    if (isString(path)) path = s2p(tree)(path);

    // no element in a path array can be an empty string
    validate(2, { path });

    if (isEqual(path, rootNodePath)) return path;

    // internally, the path of a node MUST always begin with the root node path
    path = isEqual(castArray(head(path)), rootNodePath)
      ? path // root node path is already there
      : concat(rootNodePath, path);

    // return the node when it exists.
    if (_dataMap.has(p2s(tree)(path))) return path;

    // when path length is 2 (root + path) they might want a descendent
    if (distinct && path.length === 2) {
      const np = find(
        (k) => last(s2p(tree)(k)) === last(path),
        [..._dataMap.keys()]
      );
      if (np && !isEmpty(np)) path = s2p(tree)(np);
    }

    return path;
  };
}

/**
 * provides descendent entries, optionally at the provided path, and below
 *
 * @param {Boolean} inclusive Optional.
 * Defaults to false.
 *
 * When true, the entry for the path itself will be included.
 *
 * @param {Integer} depth Optional.
 * Defaults to the maximum depth of the tree.
 *
 * An integer representing the maximum depth from the path.
 * 
 * @param {Tree} tree Required.
 *
 * @param {*} path Optional.
 * Must be a String, pathStringDelimiter delimited String, or Array.
 *
 * When undefined, blank, or empty, the root node's path will be utilized.
 *
 * @returns an array of node entries
 *
 * @throws depth must be an integer
 * @throws depth cannot be zero when inclusive is false
 */
export function descendents(inclusive, depth, tree, path) {
  const { _dataMap, depth:treeDepth } = tree;
  inclusive = inclusive ?? false;
  validate(6, { depth });
  validate(7, { depth, inclusive });
  const fp = deriveFullPath(tree)(path);

  function maxDepth(treeDepth, pathSize, depth) {
      depth = depth + pathSize;
      return (depth > treeDepth) ? treeDepth : depth ;
  }

  const md = isNil(depth) ? treeDepth : maxDepth(treeDepth, size(fp), depth);
  const target = p2s(tree)(fp);
  return flow(
      filter(([sk, d]) => {
          if (sk === target && !inclusive) return false;
          if (size(s2p(tree)(sk)) > md) return false;
          return startsWith(target, sk);
      }),
      map(([k, v]) => [s2p(tree)(k), v]) // NOTE not p2228t
    )([..._dataMap.entries()]);
};

/**
 * elaborates the set of paths for a full path
 *
 * @param {Array} path Required.
 * 
 * Must be a full path to a node
 * 
 * Defaults to an empty array.
 *
 * @returns {Array} a descending (from the root) array of paths to the node
 */
export function lineageForPath(path) {
  return times((i) => take(add(1, i), path), path.length);
};

/**
 * curried function to nest ancestors and descendents including keys, values, or both keys and values
 * 
 * @param {Function} keyFormatter Optional.
 * 
 * Function used to format keys.
 * 
 * Defaults to identity
 * 
 * 
 * @param {String} only Optional.
 * 
 * One of: 'keys', 'values', or undefined
 * 
 * Defaults to undefined
 * 
 * Determines whether keys ('keys'), values('values'),
 * or both keys and values(undefined) are included in the nested array
 * 
 * @param {Array} entries Optional.
 * 
 * An array of node entries
 * 
 * Defaults to an empty array
 * 
 */
export const nest = curry(function (tree, keyFormatter, only, entries) {
  keyFormatter = keyFormatter ?? identity;
  entries = isNil(entries) ? [] : entries;

  validate(19, { only });

  const curDepth = flow(map(([fp, v]) => size(fp)),min)(entries);
  const [cdn, ldn] = partition(([fp, v]) => size(fp) === curDepth, entries);

  return map(([fp, v]) => {
    const sk = p2s(tree)(fp);
    const descendents = filter(([dfp, dv]) => startsWith(sk, p2s(tree)(dfp)))(ldn);
    return (only === 'keys')
      ? [ keyFormatter(fp), nest(tree, keyFormatter, only, descendents) ]
      : (only === 'values')
        ?  [ v, nest(tree, keyFormatter, only, descendents) ]
        : [ keyFormatter(fp), v, nest(tree, keyFormatter, only, descendents) ]
        ;
  })(cdn);
});


/**
 * curried function to provide basic metadata about a node
 *
 * @param {Tree}
 * @param {Array} path Required.
 * 
 * A full node id path array.
 * 
 * @returns an object of fun metadata
 */
export const meta = curry(function (tree, path) {
  const { distinct } = tree;
  validate(1, { path });
  const depth = tail(path).length;
  const hasParent = depth > 0;
  const parentPath = take(depth, path);
  const distinctAncestor = distinct
    ? hasParent
      ? last(parentPath)
      : undefined
    : null;
  return {
    depth,
    distinctAncestor,
    hasParent,
    parentPath,
  };
});

/**
 * curried function to provide either a full path or tip
 *
 * @param {Tree}
 * @param {*} path Required.
 * 
 * The full path to a node
 * 
 * @returns a single node id or a node id path array
 */
export const p2228t = curry(function (tree, path) {
  const { _dataMap, distinct, hasRootDatum, rootNodePath, showRoot } = tree;
  validate(1, { path });
  let p = isString(path) ? s2p(tree)(path) : path;
  const isRootPath = isEqual(rootNodePath, p);
  const show =
    showRoot === "auto"
      ? hasRootDatum
      : showRoot === "yes";

  return distinct ? last(p) : show ? p : isRootPath ? [] : tail(p);
});

/**
 * curried function to convert a path array to a string delimited with a pathStringDelimiter
 *
 * @param {Tree}
 * @param {Array} pathArray Optional, Defaults to an empty string.
 * 
 * @returns {String}
*/
export const p2s = curry(function (tree, pathArray) {
  const { pathStringDelimiter:pathStringDelimiter } = tree;
  return join(pathStringDelimiter, pathArray);
});

/**
 * curried function to convert a string delimited with a pathStringDelimiter to an array.
 *
 * @param {Tree}
 * @param {String} pathString Optional, Defaults to an empty string.
 * 
 * @returns {Array}
 */
export const s2p = curry(function (tree, pathString) {
  const { pathStringDelimiter:pathStringDelimiter } = tree;
  return split(pathStringDelimiter, pathString);
});

