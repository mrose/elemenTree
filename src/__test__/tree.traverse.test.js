import { Tree } from '../tree';

describe(`A tree's traverse method`, () => {
 
  test(`applies a function to set of node data`, () => {
    const tree = Tree.factory();
    tree.set('root', { key: 'root', value: 1 });
    tree.set(['a'], { key: 'a', value: 2 });
    tree.set(['a', 'b'], { key: 'b', value: 3 });
    tree.set('a|b|c', { key: 'c', value: 4 });
    tree.set('a|d', { key: 'd', value: 5 });
    tree.set('a|d|e', { key: 'e', value: 6 });
    tree.set('a|d|e|f', { key: 'f', value: 7 });
    const add10 = ([k, v]) => ({ key: v.key, value: v.value + 10 });
    expect(() => tree.traverse(add10, 'a|b', 'invalid')).toThrow();

    // below also executes the cascade
    // so we don't need to invoke:    tree.traverse(add10, 'a|d|e|f', 'desc');
    // an empty object is returned which can be used as a thenable
    expect(tree.traverse(add10, 'a|d|e|f', 'desc')).toBeInstanceOf(Object);

    expect(tree.get(['root'])).toEqual([['root'], { key: 'root', value: 11 }]);
    expect(tree.get('a')).toEqual([['root', 'a'], { key: 'a', value: 12 }]);
    expect(tree.get('a|b')).toEqual([
      ['root', 'a', 'b'],
      { key: 'b', value: 3 }
    ]);
    expect(tree.get('a|b')).toEqual([
      ['root', 'a', 'b'],
      { key: 'b', value: 3 }
    ]);
    expect(tree.get('a|b|c')).toEqual([
      ['root', 'a', 'b', 'c'],
      { key: 'c', value: 4 }
    ]);
    expect(tree.get('a|d')).toEqual([
      ['root', 'a', 'd'],
      { key: 'd', value: 15 }
    ]);
    expect(tree.get('a|d|e')).toEqual([
      ['root', 'a', 'd', 'e'],
      { key: 'e', value: 16 }
    ]);
    expect(tree.get('a|d|e|f')).toEqual([
      ['root', 'a', 'd', 'e', 'f'],
      { key: 'f', value: 17 }
    ]);
  });
 
});
