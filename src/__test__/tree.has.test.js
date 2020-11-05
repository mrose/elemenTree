import { Tree } from '../tree';

describe(`A tree's has method`, () => {
  test(`tests whether a node exists`, () => {
    const tree = Tree.factory();
    //n.b. the root node can be referred to as an empty path
    expect(tree.has()).toBeTruthy();
    expect(tree.has([])).toBeTruthy();
    expect(tree.has(tree.path)).toBeTruthy();
    tree.set(['a', 'b']);
    tree.set(['a', 'c']);
    // n.b. intermediate node is written and is truthy even though no datum is assigned.
    expect(tree.has(['a'])).toBeTruthy();
    expect(tree.has(['a', 'c'])).toBeTruthy();
    expect(tree.has(['a', 'b'])).toBeTruthy();
    // use the asDescendent flag when node ids are distinct
    expect(tree.has('c', true)).toBeTruthy();
  });
});
