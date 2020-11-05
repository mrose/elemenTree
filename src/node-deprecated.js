import _ from 'lodash';

// TODO: convert to static properties
const ROOT_NODE_ID = 'root';
const PATH_STRING_DELIMITER = '|';

/**
 * @classdesc Base Class representing a Node, which is a member of a Tree structure.
 */
export class Node {
  /**
   * Create a node, (the static factory method is preferred)
   * @param {array} path required the path of this node. Can also be a delimited string.
   * @param {string} path_string_delimiter optional delimiter to use when paths are strings. Defaults to "|".
   */
  constructor(path, path_string_delimiter = PATH_STRING_DELIMITER) {
    this.path_string_delimiter = path_string_delimiter;
    // the path is an array of nodes.
    // when passed in as a delimited string it is coerced
    this.path = this.__coerce(path);
    this._nodes = new Map();
  }

  /**
   * factory method to create a new instance of a Node
   * @static
   * @param {object} required, see constructor for object contents
   */
  static factory({ path, path_string_delimiter } = {}) {
    return new Node(path, path_string_delimiter);
  }

  /**
   * numeric depth of this node
   * @readonly
   */
  get depth() {
    return _.tail(this.path).length;
  }

  /**
   * array of [key, nodes]
   * @readonly
   */
  get entries() {
    return [...this._nodes];
  }

  /**
   * boolean property
   * @readonly
   */
  get hasNodes() {
    return this._nodes.size > 0;
  }

  /**
   * @readonly
   * @returbs {boolean}
   */
  get hasParent() {
    return this.depth > 0;
  }

  /**
   * array of the keys of it's nodes
   * @readonly
   * @returns {array}
   */
  get keys() {
    return _.map([...this._nodes], _.first);
  }

  /**
   * array of the path of it's parent
   * @readonly
   * @returns {array}
   */
  get parentPath() {
    return _.take(this.path, this.depth);
  }

  /**
   * path, converted to a delimited string
   * @readonly
   */
  get pathAsString() {
    return this.__p2s(this.path);
  }

  /**
   * number of nodes this node posesses
   * @readonly
   */
  get size() {
    return this._nodes.size;
  }

  /**
   * an array of it's nodes
   * @readonly
   */
  get values() {
    return _.map([...this._nodes], _.last);
  }

  /**
   * removes all nodes
   */
  clear() {
    this._nodes.clear();
  }

  /**
   * deletes a node
   * @param {*} path required, an array or delimited string
   */
  delete(path) {
    if (_.isArray(path)) path = this.__p2s(path);
    if (!_.isString(path)) throw new Error(`path must be an array or string`);
    return this._nodes.delete(path);
  }

  /**
   * @returns an iterator of it's nodes
   *
   */
  entriesIterator() {
    return this._nodes.entries();
  }

  /**
   * executes the provided function once for each node, in insertion order
   * @param {*} fn
   * @returns {undefined}
   */
  forEach(fn) {
    return this._nodes.forEach(fn);
  }

  /**
   *
   * @param {*} path required, an array or delimited string
   * @returns the node at the requested path
   * @throws path must be an array or string
   * @throws node does not exist, try has?
   */
  get(path) {
    if (_.isArray(path)) path = this.__p2s(path);
    if (!_.isString(path)) throw new Error(`path must be an array or string`);
    if (!this.has(path)) throw new Error(`node does not exist, try has?`);
    return this._nodes.get(path);
  }

  /**
   *
   * @param {*} path required, an array or delimited string
   * @returns true when the node exists for the requested path, otherwise false
   * @throws path must be an array or string
   */
  has(path) {
    if (_.isArray(path)) path = this.__p2s(path);
    if (!_.isString(path)) throw new Error(`path must be an array or string`);
    return this._nodes.has(path);
  }

  /**
   * set a node
   * @param {*} path required, an array or delimited string
   * @throws path must be a string or array
   * @throws path cannot be blank or empty
   */
  set(path) {
    if (_.isArray(path)) path = this.__p2s(path);
    if (!_.isString(path))
      throw new Error(`path must be a string or array (was "${path}")`);
    if (!path.length) throw new Error(`path cannot be blank or empty`);

    if (this.has(path)) return this.get(path);
    return this.__setNode(path);
  }

  // private! please use the public api - - - - - - - - - - - - - - - - - - - *

  /**
   * convert an array or delimited string to an internally useable array
   * @access private
   * @param {*} path required, an array or delimited string
   * @throws path cannot be blank
   * @throws path must be an array or a string
   * @throws path cannot be empty (when path is an array)
   */
  __coerce(path = []) {
    if (_.isString(path) && !path.length)
      throw new Error('path cannot be blank');
    if (_.isString(path)) path = this.__s2p(path);
    if (!_.isArray(path)) throw new Error('path must be an array or a string');
    if (!path.length) throw new Error('path cannot be empty');

    // path of a node always begins with this' path
    return _.isNil(this.path)
      ? path // we are setting this.path.
      : _.isEqual([_.head(path)], this.path)
      ? path // it's already there
      : _.concat(this.path, path);
  }

  /**
   * convert an array to a delimited string
   * @access private
   * @param {array} path
   */
  __p2s(path = []) {
    return _.join(path, this.path_string_delimiter);
  }

  /**
   * convert a delimited string to an array
   * @access private
   * @param {string} pathString (delimited)
   */
  __s2p(pathString = '') {
    return _.split(pathString, this.path_string_delimiter);
  }

  /**
   * set a node
   * @access private
   * @param {string} path (delimited)
   */
  __setNode(path) {
    const { path_string_delimiter } = this;
    const n = Node.factory({ path, path_string_delimiter });
    this._nodes.set(path, n);
    return n;
  }

  /**
   * set nodes recursively
   * @access private
   * @param {array} path, required
   * @oaram {Node} Node, required
   * n.b since _set is a recursive function path coercion,
   * if required, must precede
   */
  __set(path = [], node) {
    if (!node) throw new Error('node must be provided');
    if (!_.isArray(path)) throw new Error('path must be an array');
    if (!path.length) throw new Error('path cannot be empty');

    const idx = node.path.length + 1;
    if (path.length < idx) return; // nothing to do

    const ss = _.take(path, idx); // e.g. ['root, 'a']
    const nn = node.__setNode(this.__p2s(ss));

    if (path.length > idx) {
      this.__set(path, nn);
    }
  }
}
