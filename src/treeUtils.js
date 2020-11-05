import _concat from 'lodash-es/concat';
import _find from 'lodash-es/find';
import _forEach from 'lodash-es/forEach';
import _isArray from 'lodash-es/isArray';
import _isEmpty from 'lodash-es/isEmpty';
import _isEqual from 'lodash-es/isEqual';
import _isString from 'lodash-es/isString';
import _head from 'lodash-es/head';
import _last from 'lodash-es/last';
import _join from 'lodash-es/join';
import _split from 'lodash-es/split';
import _take from 'lodash-es/take';

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
    throw new Error('path must be an array or a string');

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
      (k) => _last(s2p(k)) === _last(path),
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
  static nodeMeta(path, tree) {
    const depth = _tail(path).length;
    return {
      depth,
      hasParent: depth > 0,
      parentPath: _take(path, depth);
    };
  */

/**
 * convert an array to a delimited string
 * @access private
 * @param {array} path
 */
export function p2s(tree, path = []) {
  return _join(path, tree.path_string_delimiter);
}

export function p2228t(tree, path = []) {
  // probably unnecessary guard
  if (!_isArray(path) && !_isString(path))
    throw new Error('path must be an array or a string');

  const p = _isString(path) ? s2p(tree, path) : path;

  return tree.distinct ? _last(p) : p;
}

/**
 * convert a delimited string to an array
 * @access private
 * @param {string} pathString (delimited)
 */
export function s2p(tree, pathString = '') {
  return _split(pathString, tree.path_string_delimiter);
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
  if (!_isArray(path)) throw new Error('path must be an array');
  _forEach(path, (v, i) => {
    let k = p2s(_take(path, i + 1));
    if (!tree.__dataMap.has(k)) tree.__dataMap.set(k, undefined);
  });
}
