import { Tree } from '../tree';

describe(`A tree's get method`, () => {
  test(`throws an error when path argument is not a string or array`, () => {
    const tree = Tree.factory({ distinct: true });
    tree.set('a', { id: 'a', value: 1 });
    tree.set('b', { id: 'b', value: 2 }, 'a');
    tree.set('c', { id: 'c', value: 3 }, 'b');
    tree.set('d', { id: 'd', value: 4 }, 'c');

    expect(() => tree.get({ id: 'a' })).toThrow();
  });

  test(`throws an error when any element in a path argument is empty`, () => {
    const tree = Tree.factory();
    expect(() => tree.get([''])).toThrow();
    expect(() => tree.get(['a', 'b', ''])).toThrow();
    expect(() => tree.get('a|b||d')).toThrow();
  });

  test(`throws an error when the tree does not contain the path argument`, () => {
    const tree = Tree.factory();
    tree.set(['a'], { id: 'a', value: 1 });
    tree.set(['a', 'b'], { id: 'b', value: 2 });
    tree.set(['a', 'b', 'c'], { id: 'c', value: 3 });
    tree.set(['a', 'b', 'c', 'd'], { id: 'd', value: 4 });

    expect(() => tree.get([''])).toThrow();
    expect(() => tree.get(['a', 'b', ''])).toThrow();
    expect(() => tree.get('a|b||d')).toThrow();
  });

  test(`retrieves the datum associated with the provided path`, () => {
    const tree = Tree.factory({ distinct: true });
    tree.set(['a'], { id: 'a', value: 1 });
    tree.set(['a', 'b'], { id: 'b', value: 2 });
    tree.set('c', { id: 'c', value: 3 }, 'b');
    expect(tree.get('a')).toEqual({ id: 'a', value: 1 });
    expect(tree.get(['a'])).toEqual({ id: 'a', value: 1 });
    expect(tree.get(['root', 'a'])).toEqual({ id: 'a', value: 1 });
    expect(tree.get('b')).toEqual({ id: 'b', value: 2 });
    expect(tree.get('a|b')).toEqual({ id: 'b', value: 2 });
    expect(tree.get(['root', 'a', 'b'])).toEqual({ id: 'b', value: 2 });
    expect(tree.get('root|a|b')).toEqual({ id: 'b', value: 2 });
    expect(tree.get('c')).toEqual({ id: 'c', value: 3 });
    expect(tree.get('a|b|c')).toEqual({ id: 'c', value: 3 });
    expect(tree.get(['root', 'a', 'b', 'c'])).toEqual({ id: 'c', value: 3 });
    expect(tree.get('root|a|b|c')).toEqual({ id: 'c', value: 3 });
  });
});
