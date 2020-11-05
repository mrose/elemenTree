import { Tree } from '../tree';

describe(`A tree's get method`, () => {
  test(`retrieves a [path, value] node`, () => {
    const tree = Tree.factory();
    tree.set(['a']);
    tree.set(['a', 'b']);
    tree.set(['a', 'c'], ['foo', 'bar', 'baz']);
    expect(tree.get(['a', 'b'])).toEqual([['root', 'a', 'b'], undefined]);
    expect(tree.get('a|c')).toBeInstanceOf(Array);
    expect(tree.get(['a', 'c'])).toEqual([
      ['root', 'a', 'c'],
      ['foo', 'bar', 'baz']
    ]);
  });
});
