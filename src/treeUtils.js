import _concat from "lodash/concat";
import _find from "lodash/find";
import _forEach from "lodash/forEach";
import _isArray from "lodash/isArray";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _isString from "lodash/isString";
import _head from "lodash/head";
import _last from "lodash/last";
import _tail from "lodash/take";
import _take from "lodash/take";

import join from "lodash/fp/join";
import split from "lodash/fp/split";

// TODO: flatten & meta tests

/**
 * internal method to cast paths into arrays if necessary
 * @access private
 * @param {*} path, optional, must be a delimited string or array
 * @returns {array} the full path to the node
 * @throws path must be an array or a string
 */
export function coerce(tree, path = []) {
  if (!_isArray(path) && !_isString(path))
    throw new Error("path must be an array or a string");

  // an empty string or array means the root node path
  if (!path.length) return tree.rootNodePath;

  if (_isString(path)) path = s2p(path);
  if (_isEqual(path, tree.rootNodePath)) return path;

  // internally, the path of a node MUST always begin with the root node path
  path = _isEqual([_head(path)], tree.rootNodePath)
    ? path // root node path is already there
    : _concat(tree.rootNodePath, path);

  // if the path exists, return it.
  if (tree.__dataMap.has(p2s(path))) return path;

  // if path length is 2 (root + path) they might want a descendent
  if (tree.distinct && path.length === 2) {
    const np = _find(
      [...tree.__dataMap.keys()],
      (k) => _last(s2p(k)) === _last(path)
    );
    if (np && !_isEmpty(np)) path = s2p(np);
  }

  return path;
}

/**
 * @returns {boolean} true when the root datum is not undefined, else false
 */
export function hasRootDatum(tree) {
  if (!tree.__dataMap.has(tree.root_node_id)) return false;
  if (tree.__dataMap.get(tree.root_node_id) === undefined) return false;
  return true;
}

export function flatten(entries, acc = []) {
  _forEach(entries, ([path, datum, children = []]) => {
    acc.push([path, datum]);
    if (children.length) flatten(children, acc);
  });
  return acc;
}

/* static utility function which returns an object of metadata for a provided path.
/**
 * metadata
 */
export function meta(path, tree) {
  if (!_isArray(path) || path.length === 0)
    throw new Error("path must be an array or a string");

  const depth = _tail(path).length;
  const hasParent = depth > 0;
  const parentPath = _take(path, depth);
  const distinctAncestor = !tree.disinct
    ? null
    : !hasParent
    ? undefined
    : _tail(parentPath);
  return {
    depth,
    distinctAncestor,
    hasParent,
    parentPath,
  };
}

/**
 * convert a path array to a string delimited with a pathStringDelimiter
 *
 * @access private
 * @param {String} pathStringDelimiter Optional, Defaults to a pipe '|'.
 * @param {Array} arrayPath Optional, Defaults to an empty string.
 * @returns {String}
 */
export function p2s(pathStringDelimiter = "|", arrayPath = []) {
  return join(pathStringDelimiter, arrayPath);
}

export function p2228t(tree, path = []) {
  // probably unnecessary guard
  if (!_isArray(path) && !_isString(path))
    throw new Error("path must be an array or a string");

  const p = _isString(path) ? s2p(tree, path) : path;

  return tree.distinct ? _last(p) : p;
}

/**
 * convert a string delimited with a pathStringDelimiter to an array.
 *
 * @access private
 * @param {String} pathStringDelimiter Optional, Defaults to a pipe '|'.
 * @param {String} stringPath Optional, Defaults to an empty string.
 * @returns {Array}
 */
export function s2p(pathStringDelimiter = "|", stringPath = "") {
  return split(pathStringDelimiter, stringPath);
}

/**
 * assure that all nodes within a path exist
 * @access private
 * @param {array} path, required
 * n.b since __setIntermediates is a recursive function path coercion,
 * if required, must precede
 * @throws path is not an array
 */
export function setIntermediates(tree, path) {
  if (!_isArray(path)) throw new Error("path must be an array");
  _forEach(path, (v, i) => {
    let k = p2s(_take(path, i + 1));
    if (!tree.__dataMap.has(k)) tree.__dataMap.set(k, undefined);
  });
}

/**
 * Internal method to throw a defined exception.
 *
 * @access private
 * @param {Integer} id Required. The id of the message.
 * @param {Object} key/value pairs needed for message rendering.
 * @throws {Error} exception with formatted message.
 *
 */
export function treeException(id, opts = {}) {
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
    42: `all persons more than a mile high to leave the court`,
  };
  const e = id in m ? m[id] : "invalid exception";
  throw new Error(e);
}
