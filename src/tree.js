import _ from "lodash";
import castArray from "lodash/fp/castArray";
import concat from "lodash/fp/concat";
import filter from "lodash/fp/filter";
import find from "lodash/fp/find";
import flow from "lodash/fp/flow";
import forEach from "lodash/fp/forEach";
import head from "lodash/fp/head";
import includes from "lodash/fp/includes";
import isArray from "lodash/fp/isArray";
import isEmpty from "lodash/fp/isEmpty";
import isEqual from "lodash/fp/isEqual";
import isInteger from "lodash/fp/isInteger";
import isNil from "lodash/fp/isNil";
import isString from "lodash/fp/isString";
import last from "lodash/fp/last";
import map from "lodash/fp/map";
import max from "lodash/fp/max";
import min from "lodash/fp/min";
import noop from "lodash/fp/noop";
import reverse from "lodash/fp/reverse";
import split from "lodash/fp/split";
import stubTrue from "lodash/fp/stubTrue";
import take from "lodash/fp/take";
import takeRight from "lodash/fp/takeRight";

import { p2s, s2p, treeException } from "./treeUtils";

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
      writable: false,
    });
    Object.defineProperty(this, "root_node_id", {
      configurable: false,
      enumerable: true,
      value: root_node_id,
      writable: false,
    });
    Object.defineProperty(this, "distinct", {
      configurable: false,
      enumerable: true,
      value: distinct,
      writable: false,
    });

    this.__dataMap = dataMap || new Map(); //key = path[], value = {data} thar be data
    this.__dataMap.set(root_node_id, datum);
    if (show_root) this.show_root = validate(3, { show_root });
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
    show_root,
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
    const { __dataMap, path_string_delimiter } = this;
    return flow(
      map((key) => s2p(path_string_delimiter, key).length),
      max
    )([...__dataMap.keys()]);
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
    return _.castArray(this.root_node_id);
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
  cascade(fn = _.identity, path, inclusive = false) {
    path = validate(4, { path, tree: this });

    const { __dataMap, path_string_delimiter } = this;
    const target = p2s(path_string_delimiter, path);
    let fe = flow(
      filter(([sk, d]) => {
        if (!inclusive && sk === target) return false;
        return _.startsWith(sk, target);
      }),
      map(([k, v]) => [this.__p2228t(k), v])
    )([...__dataMap.entries()]);

    _.forEach(fe, (entry) => {
      const [ek, ev] = entry;
      const ret = fn([ek, ev], this);
      if (_.isUndefined(ret)) return;
      // entry must be an entry (array with path & datum elements) or undefined
      let [p, v] = validate(5, { ret });
      // we don't know what key we're getting back but we better have it
      p = validate(4, { path: p, tree: this });

      this.__dataMap.set(p2s(path_string_delimiter, p), v);
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
    const { path_string_delimiter } = this;
    const target = p2s(path_string_delimiter, p);

    let keys = _.filter([...this.__dataMap.keys()], (k) => {
      if (!inclusive && k === target) return false;
      return _.startsWith(k, target);
    });

    let allTrue = Boolean(keys.length);
    _.forEach(keys, (k) => {
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
    const p = this.__derive(path); // do not use validate here
    validate(6, { depth });
    validate(7, { depth, inclusive });

    const { __dataMap, depth: treeDepth, path_string_delimiter } = this;
    const maxDepth = depth ? p.length + depth : treeDepth;
    const target = p2s(path_string_delimiter, p);
    let fe = filter(([sk, d]) => {
      const ak = s2p(path_string_delimiter, sk);
      if (!inclusive && sk === target) return false;
      return _.startsWith(sk, target) && ak.length <= maxDepth;
    })([...__dataMap.entries()]);

    if (!nested) return map(([k, v]) => [this.__p2228t(k), v])(fe);

    const nest = (entries) =>
      map(([tk, v]) => {
        const ak = s2p(this.path_string_delimiter, tk);
        const descendents = filter(
          ([k, v]) =>
            _.startsWith(k, tk) &&
            s2p(this.path_string_delimiter, k).length === ak.length + 1
        )(fe);
        return [
          this.__p2228t(tk),
          v,
          descendents.length ? nest(descendents) : [],
        ];
      })(entries);

    // minimum depth
    const mnd = flow(
      map((key) => s2p(this.path_string_delimiter, key).length),
      min
    )(fe);

    // base nodes. we won't sort so maybe the top nodes will remain in insertion order
    const bn = filter(
      ([k, v]) => s2p(this.path_string_delimiter, k).length === mnd
    )(fe);
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
  everyOf(fn = _.identity, path, inclusive = false, depth) {
    const p = validate(4, { path, tree: this });
    validate(6, { depth });
    validate(7, { depth, inclusive });

    const { __dataMap, depth: treeDepth, path_string_delimiter } = this;
    const maxDepth = depth ? p.length + depth : treeDepth;

    const target = p2s(path_string_delimiter, p);
    let fe = flow(
      filter(([sk, d]) => {
        const ak = s2p(path_string_delimiter, sk);
        if (!inclusive && sk === target) return false;
        return _.startsWith(sk, target) && ak.length <= maxDepth;
      }),
      map(([k, v]) => [this.__p2228t(k), v])
    )([...__dataMap.entries()]);
    return _.every(fe, fn);
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
    const { __dataMap, path_string_delimiter } = this;
    const fdo = ([sk, v]) => {
      if (s2p(path_string_delimiter, sk).length !== p.length + 1) return false;
      return _.startsWith(sk, p2s(path_string_delimiter, p));
    };

    return flow(
      filter(fdo),
      map(([sk, v]) => [this.__p2228t(sk), v])
    )([...__dataMap.entries()]);
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
    const p = validate(4, { path, tree: this });
    const { __dataMap, path_string_delimiter } = this;
    return __dataMap.get(p2s(path_string_delimiter, p));
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
    path = validate(4, { path, tree: this });
    const { parentPath } = this.__meta(path);
    validate(8, { path: this.root_node_id, parentPath });
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
    const { path_string_delimiter } = this;
    return this.__dataMap.has(p2s(path_string_delimiter, p));
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
    const p = this.__derive(path); // do not use validate here
    validate(6, { depth });
    validate(7, { depth, inclusive });

    const { __dataMap, depth: treeDepth, path_string_delimiter } = this;
    const maxDepth = depth ? p.length + depth : treeDepth;
    const target = p2s(path_string_delimiter, p);

    let fe = filter((k) => {
      const ak = s2p(path_string_delimiter, k);
      if (!inclusive && k === target) return false;
      return _.startsWith(k, target) && ak.length <= maxDepth;
    })([...__dataMap.keys()]);

    if (!nested) return map((k) => this.__p2228t(k))(fe);

    const nest = (keys) =>
      map((tk) => {
        const ak = s2p(path_string_delimiter, tk);
        const descendents = _.filter(
          fe,
          (k) =>
            _.startsWith(k, tk) &&
            s2p(path_string_delimiter, k).length === ak.length + 1
        );
        return [this.__p2228t(tk), descendents.length ? nest(descendents) : []];
      })(keys);

    // minimum depth
    const mnd = flow(
      map((key) => s2p(path_string_delimiter, key).length),
      min
    )(fe);

    // base nodes. we won't sort so at least the top nodes will remain in insertion order
    const bn = filter((k) => s2p(path_string_delimiter, k).length === mnd)(fe);
    return nest(bn);
  }

  /**
   * Merge a Tree into an existing target Tree.
   * @param {Tree} source
   * @throws non distinct trees cannot be merged into distinct trees
   */
  merge(source) {
    validate(9, {
      sourceDistinct: source.distinct,
      targetDistinct: this.distinct,
    });

    const ies = source.__dataMap.entries();
    flow(
      map(([k, v]) => [_.split(k, source.path_string_delimiter), v]),
      forEach(([k, v]) => this.set(k, v))
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
   * @throws ancestor does not exist (when the ancestor provided is not in the tree)
   * @throws ancestor argument cannot be used to set nodes on distinct trees, full node id paths are required
   * @throws ancestor must be a simple string or single element array
   * @throws path already exists in this distinct tree
   * @throws elements in a path cannot be duplicated with distinct trees
   */
  set(path, datum = undefined, ancestor = undefined) {
    let d,
      p = path;
    p = this.__derive(p);
    const { __dataMap, distinct, path_string_delimiter } = this;
    let exists = __dataMap.has(p2s(path_string_delimiter, p));
    let meta = this.__meta(p);

    if (!isNil(ancestor)) {
      validate(11, { distinct, path });
      validate(10, { ancestor });
    }

    if (distinct) {
      if (!isNil(ancestor)) {
        if (exists) {
          // no duplicate node id!
          validate(121, { ancestor, path, path_string_delimiter, tree: this });

          // is it update
          __dataMap.set(p2s(path_string_delimiter, p), datum);
          return this.__p2228t(p);
        }

        // i.e. root + something
        validate(14, { ancestor, datum, path, tree: this });

        // ancestor should exist
        /*
        validate(15, {
          ancestor,
          __dataMap,
          path_string_delimiter,
          tree: this,
        });
        */
        d = this.__derive(ancestor);
        if (!__dataMap.has(p2s(path_string_delimiter, d)))
          treeException(15, { ancestor });

        p = _.concat(d, _.tail(p));
      }

      // distinctness checks
      _.forEach(p, (tip, i) => {
        const nidx = i + 1;
        let k = p2s(path_string_delimiter, _.take(p, nidx));
        //      validate(122,{ k, path_string_delimiter, tip, tree });
        let np = this.__derive(tip);
        let ta = p2s(path_string_delimiter, np);
        exists = __dataMap.has(ta);

        if (exists & (k !== ta)) {
          meta = this.__meta(np);
          treeException(12, {
            path: tip,
            ancestor: meta.distinctAncestor,
          });
        }

        const idx = p.length - nidx;
        validate(16, { idx, path: p, tip });
      });
    } // end of distincty town

    if (p.length === 1) {
      __dataMap.set(this.root_node_id, datum);
      return _.castArray(this.root_node_id);
    }

    // set intermediate nodes
    _.forEach(p, (v, i) => {
      let k = p2s(path_string_delimiter, _.take(p, i + 1));
      if (!__dataMap.has(k)) __dataMap.set(k, undefined);
    });

    __dataMap.set(p2s(path_string_delimiter, p), datum);
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
  someOf(fn = _.identity, path, inclusive = false, depth) {
    const p = validate(4, { path, tree: this });
    validate(6, { depth });
    validate(7, { depth, inclusive });

    const { __dataMap, depth: treeDepth, path_string_delimiter } = this;
    const maxDepth = depth ? p.length + depth : treeDepth;

    const target = p2s(path_string_delimiter, p);
    let fe = flow(
      filter(([sk, d]) => {
        const ak = s2p(path_string_delimiter, sk);
        if (!inclusive && sk === target) return false;
        return _.startsWith(sk, target) && ak.length <= maxDepth;
      }),
      map(([k, v]) => [this.__p2228t(k), v])
    )([...__dataMap.entries()]);

    return _.some(fe, fn);
  }

  /**
   * Apply a function to each node in a path in a specified order.
   *
   * @param {Function} fn Optional.
   * Defaults to _.identity.
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
  traverse(fn = _.identity, path, order = "desc") {
    path = validate(4, { path, tree: this });

    validate(17, { order });

    const { __dataMap, path_string_delimiter } = this;
    // get keys for each node
    let keys = _.map(path, (v, idx) => _.take(path, idx + 1));
    if (order === "asc") keys = _.reverse(keys);

    _.forEach(keys, (k) => {
      const sk = p2s(path_string_delimiter, k);
      const d = __dataMap.get(sk);
      let entry = [this.__p2228t(k), d];

      const ret = fn(entry, this);
      if (_.isUndefined(ret)) return;
      // entry must be an entry (array with path & datum elements) or undefined
      let [p, v] = validate(5, { ret });
      // we don't know what key we're getting back but we better have it
      p = validate(4, { path: p, tree: this });
      this.__dataMap.set(p2s(path_string_delimiter, p), v);
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
    const p = this.__derive(path); // do not use validate here
    validate(6, { depth });
    validate(7, { depth, inclusive });

    const { __dataMap, depth: treeDepth, path_string_delimiter } = this;
    const maxDepth = depth ? p.length + depth : treeDepth;
    const target = p2s(path_string_delimiter, p);
    let fe = filter(([sk, d]) => {
      const ak = s2p(path_string_delimiter, sk);
      if (!inclusive && sk === target) return false;
      return _.startsWith(sk, target) && ak.length <= maxDepth;
    })([...__dataMap.entries()]);

    if (!nested) return map(([k, v]) => v)(fe);

    const nest = (entries) =>
      map(([tk, v]) => {
        const ak = s2p(path_string_delimiter, tk);
        const descendents = filter(
          ([k, v]) =>
            _.startsWith(k, tk) &&
            s2p(path_string_delimiter, k).length === ak.length + 1
        )(fe);
        return [v, descendents.length ? nest(descendents) : []];
      })(entries);

    // minimum depth
    const mnd = flow(
      map((key) => s2p(path_string_delimiter, key).length),
      min
    )(fe);

    // base nodes. we won't sort so at least the top nodes will remain in insertion order
    const bn = filter(([k, v]) => s2p(path_string_delimiter, k).length === mnd)(
      fe
    );
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
    path = validate(1, { path });

    const { __dataMap, distinct, path_string_delimiter, rootNodePath } = this;

    // an empty string or empty array means the root node path
    if (!path.length) return rootNodePath;

    if (_.isString(path)) path = s2p(path_string_delimiter, path);

    // no element in a path can be an empty string
    path = validate(2, { path });

    if (_.isEqual(path, rootNodePath)) return path;

    // internally, the path of a node MUST always begin with the root node path
    path = _.isEqual([_.head(path)], rootNodePath)
      ? path // root node path is already there
      : _.concat(rootNodePath, path);

    // when the node entry exists, return it.
    if (__dataMap.has(p2s(path_string_delimiter, path))) return path;

    // when path length is 2 (root + path) they might want a descendent
    if (distinct && path.length === 2) {
      const np = _.find(
        [...__dataMap.keys()],
        (k) => _.last(s2p(path_string_delimiter, k)) === _.last(path)
      );
      if (np && !_.isEmpty(np)) path = s2p(path_string_delimiter, np);
    }

    return path;
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
    path = validate(1, { path });

    const depth = _.tail(path).length;
    const hasParent = depth > 0;
    const parentPath = _.take(path, depth);
    const distinctAncestor = this.distinct
      ? hasParent
        ? _.last(parentPath)
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
    path = validate(1, { path });
    const {
      __dataMap,
      distinct,
      path_string_delimiter,
      root_node_id,
      show_root,
    } = this;
    let p = _.isString(path) ? s2p(path_string_delimiter, path) : path;
    const tip = _.last(p);
    const show =
      show_root === "auto"
        ? !!__dataMap.get(root_node_id)
        : show_root === "yes";

    return distinct ? tip : show ? p : p.length === 1 ? [] : _.tail(p);
  }
}

/**
 * Internal method to throw a defined exception.
 *
 * @access private
 * @param {Integer} id Required. The id of the message.
 * @param {Object} key/value pairs needed for validation and message rendering.
 * @throws {Error} exception with formatted message.
 *
 */
export function validate(id, opts = {}) {
  const c = {
    1: [
      ({ path }) => !isArray(path) && !isString(path),
      ({ path }) => `path must be an array or a string`,
      ({ path }) => path,
    ],
    2: [
      ({ path }) => _.some(path, (p) => p.length === 0),
      ({ path }) => `elements in a path cannot be empty strings`,
      ({ path }) => path,
    ],
    3: [
      ({ show_root }) => !includes(show_root, ["yes", "no", "auto"]),
      ({}) => `show_root must be one of: 'yes', 'no', or 'auto`,
      ({ show_root }) => show_root,
    ],
    4: [
      ({ path, tree }) => !tree.has(path),
      ({ path, tree }) => `path ${path} does not exist, use has?`,
      ({ path, tree }) => tree.__derive(path),
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
      ({ depth, inclusive }) => depth === 0 && !inclusive,
      ({ depth, inclusive }) => `depth cannot be zero when inclusive is false`,
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
      ({ ancestor, path, path_string_delimiter, tree }) => {
        // no duplicate node id!
        const p = tree.__derive(path);
        const ta = p2s(
          path_string_delimiter,
          isString(ancestor) ? castArray(ancestor) : ancestor
        );
        const { distinctAncestor } = tree.__meta(p);
        return ta !== distinctAncestor;
      },
      ({ ancestor, path, path_string_delimiter, tree }) => {
        const p = tree.__derive(path);
        const ta = p2s(
          path_string_delimiter,
          isString(ancestor) ? castArray(ancestor) : ancestor
        );
        const { distinctAncestor } = tree.__meta(p);
        return `path ${ta} already exists in this distinct tree with ancestor ${distinctAncestor}`;
      },
    ],
    /*
    122: [
      ({ k, path_string_delimiter, tip, tree }) => {
        let ta = p2s(path_string_delimiter, this.__derive(tip));
        return tree.__dataMap.has(ta) & (k !== ta);
      },
      ({ k, path_string_delimiter, tip, tree }) => {
        meta = tree.__meta(tree.__derive(tip));
        return `path ${tip} already exists in this distinct tree with ancestor ${meta.ancestor}`;
      },
    ],
*/
    14: [
      ({ path, datum, ancestor, tree }) => tree.__derive(path).length > 2,
      ({ path, datum, ancestor, tree }) =>
        `path must be a simple string, received ${path}, ${datum}, ${ancestor}`,
    ],
    15: [
      ({ ancestor, __dataMap, path_string_delimiter, tree }) =>
        !__dataMap.has(p2s(path_string_delimiter, tree.__derive(ancestor))),
      ({ ancestor, __dataMap, path_string_delimiter, tree }) =>
        `ancestor ${ancestor} does not exist`,
    ],
    16: [
      ({ idx, path, tip }) => includes(tip, takeRight(idx, path)),
      ({ nidx, path, tip }) =>
        `elements in path ${path} cannot be duplicated with distinct trees`,
    ],
    17: [
      ({ order }) => !includes(order, ["asc", "desc"]),
      ({ order }) => `order must be one of "asc, desc", was ${order}`,
    ],
    42: [
      stubTrue,
      () => `all persons more than a mile high to leave the court`,
    ],
    999: [stubTrue, () => `invalid or unknown exception`],
  };
  const [condition, error, ret = noop] = id in c ? c[id] : c[999];
  if (condition(opts)) throw new Error(error);
  return ret(opts);
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
export function deriveFullPath(tree) {
  const { __dataMap, distinct, path_string_delimiter, rootNodePath } = tree;
  return function (path) {
    path = validate(1, { path });

    if (!path.length)
      // an empty string or empty array means the root node path
      return rootNodePath;

    if (isString(path)) path = s2p(path_string_delimiter, path);

    // no element in a path can be an empty string
    path = validate(2, { path });

    if (isEqual(path, rootNodePath)) return path;

    // internally, the path of a node MUST always begin with the root node path
    path = isEqual(head(castArray(path)), rootNodePath)
      ? path // root node path is already there
      : concat(rootNodePath, path);

    // return the node when it exists.
    if (__dataMap.has(p2s(path_string_delimiter, path))) return path;

    // when path length is 2 (root + path) they might want a descendent
    if (distinct && path.length === 2) {
      const np = find(
        (k) => last(s2p(path_string_delimiter, k)) === last(path),
        [...__dataMap.keys()]
      );
      if (np && !isEmpty(np)) path = s2p(path_string_delimiter, np);
    }

    return path;
  };
}
