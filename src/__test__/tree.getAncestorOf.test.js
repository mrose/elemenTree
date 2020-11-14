import { Tree } from '../tree';

describe(`The getAncestorOf method`, () => {
  test(`throws an error when path argument is not a string or array`, () => {
    const tree = Tree.factory({ distinct: true });
    tree.set('a', { id: 'a', value: 1 });
    tree.set('b', { id: 'b', value: 2 }, 'a');
    tree.set('c', { id: 'c', value: 3 }, 'b');
    tree.set('d', { id: 'd', value: 4 }, 'c');

    expect(() => tree.getAncestorOf({ id: 'a' })).toThrow();
  });

  test(`throws an error when any element in a path argument is empty`, () => {
    const tree = Tree.factory();
    expect(() => tree.getAncestorOf([''])).toThrow();
    expect(() => tree.getAncestorOf(['a', 'b', ''])).toThrow();
    expect(() => tree.getAncestorOf('a|b||d')).toThrow();
  });

  test(`throws an error when the tree does not contain the path argument`, () => {
    const tree = Tree.factory();
    tree.set(['a'], { id: 'a', value: 1 });
    tree.set(['a', 'b'], { id: 'b', value: 2 });
    tree.set(['a', 'b', 'c'], { id: 'c', value: 3 });
    tree.set(['a', 'b', 'c', 'd'], { id: 'd', value: 4 });

    expect(() => tree.getAncestorOf([''])).toThrow();
    expect(() => tree.getAncestorOf(['a', 'b', ''])).toThrow();
    expect(() => tree.getAncestorOf('a|b||d')).toThrow();
  });

  test(`throws an error when the ancestor of the root node is requested`, () => {
    const tree = Tree.factory();
    expect(() => tree.getAncestorOf()).toThrow();
    expect(() => tree.getAncestorOf([])).toThrow();
    expect(() => tree.getAncestorOf('')).toThrow();
    expect(() => tree.getAncestorOf(['root'])).toThrow();
    expect(() => tree.getAncestorOf('root')).toThrow();
  });

  describe(`for trees which have distinct node Ids (default)`, () => {
    test(`retrieves a [path, value] node for the ancestor of the provided id`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set('a', { id: 'a', value: 1 });
      tree.set('b', { id: 'b', value: 2 }, 'a');
      tree.set('c', { id: 'c', value: 3 }, 'b');
      tree.set('d', { id: 'd', value: 4 }, 'c');

      expect(tree.getAncestorOf('a')).toEqual(undefined);
      expect(tree.getAncestorOf('b')).toEqual({ id: 'a', value: 1 });
      expect(tree.getAncestorOf('c')).toEqual({ id: 'b', value: 2 });
      expect(tree.getAncestorOf('d')).toEqual({ id: 'c', value: 3 });
    });
  });

  describe(`for trees which have non-distinct node Ids`, () => {
    test(`retrieves a [path, value] node for the ancestor of the provided id`, () => {
      const tree = Tree.factory({ distinct: false });
      tree.set(['a'], { id: 'a', value: 1 });
      tree.set(['a', 'b'], { id: 'b', value: 2 });
      tree.set(['a', 'b', 'c'], { id: 'c', value: 3 });
      tree.set(['a', 'b', 'c', 'd'], { id: 'd', value: 4 });

      expect(tree.getAncestorOf(['a'])).toEqual(undefined);
      expect(tree.getAncestorOf('a|b')).toEqual({ id: 'a', value: 1 });
      expect(tree.getAncestorOf(['a', 'b', 'c'])).toEqual({
        id: 'b',
        value: 2
      });
      expect(tree.getAncestorOf('a|b|c|d')).toEqual({ id: 'c', value: 3 });
    });
  });
});
