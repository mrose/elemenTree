import { Node } from './node';
//import _ from 'lodash';

describe('A node', () => {
  test('should be created with the static factory method', () => {
    const node = Node.factory({ path: 'root' });
    expect(node).toBeInstanceOf(Node);
  });

  test(`must be provided with a path, which must be one of a string or array`, () => {
    expect(() => Node.factory()).toThrow();
    const node0 = Node.factory({ path: ['a', 'b', 'c'] });
    expect(node0.path).toEqual(['a', 'b', 'c']);
    const node1 = Node.factory({ path: 'a|b|c' });
    expect(node1.path).toEqual(['a', 'b', 'c']);
  });

  test(`can be provided a path string delimiter which defaults to "|"`, () => {
    expect(Node.factory({ path: 'root' }).path_string_delimiter).toEqual('|');
    const node = Node.factory({ path: 'root', path_string_delimiter: '_' });
    expect(node.path_string_delimiter).toBe('_');
  });

  test(`has a depth property (convenience)`, () => {
    const node = Node.factory({ path: ['root', 'a', 'b'] });
    // root node is not counted
    expect(node.depth).toBe(2);
  });

  test(`has an entries property (convenience) which returns an array of [key, nodes] entries`, () => {
    const node = Node.factory({ path: 'root' });
    node.set('a');
    node.set('b');
    node.set('c');
    expect(node.entries).toBeInstanceOf(Array);
    expect(node.entries.length).toBe(3);
    expect(node.entries[0][0]).toBe('a');
    expect(node.entries[0][1]).toBeInstanceOf(Node);
    expect(node.entries[1][0]).toBe('b');
    expect(node.entries[1][1]).toBeInstanceOf(Node);
    expect(node.entries[2][0]).toBe('c');
    expect(node.entries[2][1]).toBeInstanceOf(Node);
  });

  test(`has a hasNodes property (convenience)`, () => {
    const node = Node.factory({ path: 'root' });
    expect(node.hasNodes).toBe(false);
    node.set('a');
    expect(node.hasNodes).toBe(true);
  });

  test(`has a hasParent property (convenience)`, () => {
    const node = Node.factory({ path: ['a', 'b', 'c'] });
    expect(node.hasParent).toBe(true);
  });

  test(`has a keys property (convenience) which returns an array of the keys of its nodes`, () => {
    const node = Node.factory({ path: 'root' });
    node.set('a');
    node.set('b');
    node.set('c');
    expect(node.keys).toBeInstanceOf(Array);
    expect(node.keys.length).toBe(3);
    expect(node.keys).toEqual(['a', 'b', 'c']);
  });

  test(`has a parentPath property (convenience)`, () => {
    const node = Node.factory({ path: ['a', 'b', 'c'] });
    expect(node.parentPath).toEqual(['a', 'b']);
  });

  test(`has a path property (convenience)`, () => {
    const node = Node.factory({ path: 'qux' });
    expect(node.path).toEqual(['qux']);
  });

  test(`has a pathAsString property (convenience)`, () => {
    const node = Node.factory({ path: ['a', 'b', 'c'] });
    expect(node.pathAsString).toBe('a|b|c');
  });

  test(`has a size property (convenience)`, () => {
    const node = Node.factory({ path: 'root' });
    node.set(['a', 'b']);
    node.set(['a', 'c']);
    node.set(['a', 'd']);
    expect(node.size).toBe(3);
  });

  test(`has a values property (convenience) which returns an array of the values of its nodes`, () => {
    const node = Node.factory({ path: 'root' });
    node.set('a');
    node.set('b');
    node.set('c');
    expect(node.values).toBeInstanceOf(Array);
    expect(node.values.length).toBe(3);
    expect(node.values[0]).toBeInstanceOf(Node);
    expect(node.values[0]['path']).toEqual(['a']);
    expect(node.values[1]).toBeInstanceOf(Node);
    expect(node.values[1]['path']).toEqual(['b']);
    expect(node.values[2]).toBeInstanceOf(Node);
    expect(node.values[2]['path']).toEqual(['c']);
  });

  test(`has a clear() method to remove all nodes`, () => {
    const node = Node.factory({ path: 'root' });
    node.set(['a', 'b']);
    node.set(['a', 'c']);
    expect(node.size).toBe(2);
    node.clear();
    expect(node.size).toBe(0);
  });

  test(`has a delete() method to remove a node`, () => {
    const node = Node.factory({ path: 'root' });
    node.set(['a', 'b']);
    node.set(['a', 'c']);
    expect(node.size).toBe(2);
    node.delete('a|b');
    expect(node.size).toBe(1);
    expect(node.delete(['a', 'c'])).toBe(true);
    expect(node.size).toBe(0);
    expect(node.delete(['z'])).toBe(false);
  });

  test(`has an entriesIterator() method to provide an Iterator for its nodes`, () => {
    const abIterator = {
      done: false,
      value: [
        'a|b',
        {
          _nodes: new Map(),
          path: ['a', 'b'],
          path_string_delimiter: '|'
        }
      ]
    };
    const node = Node.factory({ path: 'root' });
    node.set(['a', 'b']);
    node.set(['a', 'c']);
    expect(node.entriesIterator()).toBeInstanceOf(Object);
    expect(node.entriesIterator().next()).toEqual(abIterator);
    expect(node.entriesIterator().next().value).toEqual([
      'a|b',
      node.get('a|b')
    ]);
  });

  test(`has a forEach() method which executes a provided function once per each node`, () => {
    const node = Node.factory({ path: 'root' });
    node.set('a');
    node.set('b');
    node.set('c');
    let a = [];
    node.forEach((n) => {
      expect(n).toBeInstanceOf(Node);
      a.push(n.path);
    });
    expect(a).toEqual([['a'], ['b'], ['c']]);
  });

  test(`has a get() method to retrieve a node`, () => {
    const node = Node.factory({ path: 'root' });
    node.set(['a', 'b']);
    node.set(['a', 'c']);
    expect(() => node.get(['b'])).toThrow();
    expect(() => node.get('b')).toThrow();
    expect(node.get('a|c')).toBeInstanceOf(Node);
    expect(node.get(['a', 'b'])).toBeInstanceOf(Node);
  });

  test(`has a has() method to see whether a node exists`, () => {
    const node = Node.factory({ path: 'root' });
    node.set(['a', 'b']);
    node.set(['a', 'c']);
    expect(node.has('a|c')).toBeTruthy();
    expect(node.has(['a', 'b'])).toBeTruthy();
  });

  test(`has a set() method to append a node`, () => {
    const node = Node.factory({ path: 'root' });
    node.set(['a', 'b']);
    node.set(['a', 'c']);
    // FIXME
  });

  test('has an internal __coerce() method to convert paths of strings or arrays for internal use', () => {
    const node = Node.factory({ path: 'root' });
    expect(() => node._coerce()).toThrow();
    expect(node.__coerce('root')).toEqual(['root']);
    expect(node.__coerce(['root'])).toEqual(['root']);
    expect(node.__coerce('root|foo')).toEqual(['root', 'foo']);
    expect(node.__coerce(['root', 'foo'])).toEqual(['root', 'foo']);
    // n.b. the parent node's path is AUTOMATICALLY PREPENDED
    expect(node.__coerce('bar')).toEqual(['root', 'bar']);
    //   expect(node._coerce(['bar'])).toEqual(['root', 'bar']);
    expect(node.__coerce('bar|baz')).toEqual(['root', 'bar', 'baz']);
    expect(node.__coerce(['bar', 'baz'])).toEqual(['root', 'bar', 'baz']);
    expect(node.__coerce('root|bar|baz')).toEqual(['root', 'bar', 'baz']);
    expect(node.__coerce(['root', 'foo', 'bar'])).toEqual([
      'root',
      'foo',
      'bar'
    ]);
  });

  test('has an internal __p2s() method to convert a path to a delimited string', () => {
    const node = Node.factory({ path: 'root', path_string_delimiter: '$' });
    expect(node.__p2s(['a', 'b', 'c'])).toEqual('a$b$c');
  });

  test('has an internal __s2p() method to convert a delimited string to a path', () => {
    const node = Node.factory({ path: 'root', path_string_delimiter: ':' });
    expect(node.__s2p('a:b:c')).toEqual(['a', 'b', 'c']);
  });
});
