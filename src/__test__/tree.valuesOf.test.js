import { Tree } from '../tree';

describe(`The valuesOf method`, () => {
  // path, inclusive, nested, depth
  test(`throws an error when depth is not an integer`, () => {
    const tree = Tree.factory({ distinct: false });
    tree.set(['a'], { id: 'a' });
    expect(() => tree.valuesOf(['a'], true, false, 'depth')).toThrow();
  });

  test(`throws an error when depth is zero and inclusive is false`, () => {
    const tree = Tree.factory({ distinct: false });
    tree.set(['a'], { id: 'a' });
    expect(() => tree.valuesOf(['a'], false, false, 0)).toThrow();
    expect(tree.valuesOf(['a'], true, false, 0)).toBeInstanceOf(Array);
  });

  // TODO: throws when path is invalid, inclusive is invalid, nested is invalid

  describe(`for trees which have non-distinct node Ids`, () => {
    test(`returns an empty values array when the path does not refer to an existing node`, () => {
      const tree = Tree.factory({ distinct: false });
      tree.set(['a'], { id: 'a' });
      expect(tree.valuesOf(['b'])).toEqual([]);
    });

    test(`returns an empty values array when no descendents exist and inclusive is false`, () => {
      const tree = Tree.factory({ distinct: false });
      expect(tree.valuesOf()).toEqual([]);
      expect(tree.valuesOf('root')).toEqual([]);
      expect(tree.valuesOf(['root'])).toEqual([]);

      tree.set(['a'], { id: 'a' });
      expect(tree.valuesOf('a')).toEqual([]);
      expect(tree.valuesOf('a')).toEqual([]);
      expect(tree.valuesOf(['a'])).toEqual([]);

      tree.set(['a', 'b'], { id: 'b' });
      expect(tree.valuesOf(['a', 'b'])).toEqual([]);
      expect(tree.valuesOf('a|b')).toEqual([]);
    });

    test(`returns a single entry when no descendents exist and inclusive is true`, () => {
      const tree = Tree.factory({ datum: { id: 'root' }, distinct: false });
      expect(tree.valuesOf(undefined, true)).toEqual([{ id: 'root' }]);
      expect(tree.valuesOf('root', true)).toEqual([{ id: 'root' }]);
      expect(tree.valuesOf(['root'], true)).toEqual([{ id: 'root' }]);

      tree.set(['a'], { id: 'a' });
      expect(tree.valuesOf('a', true)).toEqual([{ id: 'a' }]);
      expect(tree.valuesOf('a', true)).toEqual([{ id: 'a' }]);
      expect(tree.valuesOf(['a'], true)).toEqual([{ id: 'a' }]);

      tree.set(['a', 'b'], { id: 'b' });
      expect(tree.valuesOf(['a', 'b'], true)).toEqual([{ id: 'b' }]);
      expect(tree.valuesOf('a|b', true)).toEqual([{ id: 'b' }]);
    });

    test(`returns a flat values array of descendents when nested is false`, () => {
      const tree = Tree.factory({ distinct: false });
      tree.set('c', { id: 'c' });
      tree.set('b', { id: 'b' });
      tree.set('a', { id: 'a' });
      tree.set(['a', 'd'], { id: 'd' });
      tree.set(['a', 'e'], { id: 'e' });
      tree.set(['a', 'e', 'f'], { id: 'f' });
      tree.set(['a', 'e', 'g'], { id: 'g' });

      expect(tree.valuesOf(['a'], true, false, 1)).toEqual([
        { id: 'a' },
        { id: 'd' },
        { id: 'e' },
      ]);

      expect(tree.valuesOf(['a'], false, false)).toEqual([
        { id: 'd' },
        { id: 'e' },
        { id: 'f' },
        { id: 'g' },
      ]);

      expect(tree.valuesOf(['a', 'e'], false, false)).toEqual([
        { id: 'f' },
        { id: 'g' },
      ]);
    });

    test(`returns a nested [datum, values] array of descendents when nested is true`, () => {
      const tree = Tree.factory({ datum: { id: 'root' }, distinct: false });
      tree.set('c', { id: 'c' });
      tree.set('b', { id: 'b' });
      tree.set('a', { id: 'a' });
      tree.set(['a', 'd'], { id: 'd' });
      tree.set(['a', 'd', 'h'], { id: 'h' });
      tree.set(['a', 'e'], { id: 'e' });
      tree.set(['a', 'e', 'f'], { id: 'f' });
      tree.set(['a', 'e', 'g'], { id: 'g' });

      expect(tree.valuesOf(['a'], true, true, 1)).toEqual([
        [
          { id: 'a' },
          [
            [{ id: 'd' }, []],
            [{ id: 'e' }, []],
          ],
        ],
      ]);

      expect(tree.valuesOf(['a'], false, true)).toEqual([
        [{ id: 'd' }, [[{ id: 'h' }, []]]],
        [
          { id: 'e' },
          [
            [{ id: 'f' }, []],
            [{ id: 'g' }, []],
          ],
        ],
      ]);

      expect(tree.valuesOf(['a', 'e'], false, true)).toEqual([
        [{ id: 'f' }, []],
        [{ id: 'g' }, []],
      ]);

      expect(tree.valuesOf('root', true, true)).toEqual([
        [
          { id: 'root' },
          [
            [{ id: 'c' }, []],
            [{ id: 'b' }, []],
            [
              { id: 'a' },
              [
                [{ id: 'd' }, [[{ id: 'h' }, []]]],
                [
                  { id: 'e' },
                  [
                    [{ id: 'f' }, []],
                    [{ id: 'g' }, []],
                  ],
                ],
              ],
            ],
          ],
        ],
      ]);
    });
  });

  describe(`for trees which have distinct node Ids`, () => {
    test(`returns an empty values array when the path does not refer to an existing node`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set(['a'], { id: 'a' });
      expect(tree.valuesOf(['b'])).toEqual([]);
    });

    test(`returns an empty values array when no descendents exist and inclusive is false`, () => {
      const tree = Tree.factory({ distinct: true });
      expect(tree.valuesOf()).toEqual([]);
      expect(tree.valuesOf('root')).toEqual([]);
      expect(tree.valuesOf(['root'])).toEqual([]);

      tree.set(['a'], { id: 'a' });
      expect(tree.valuesOf('a')).toEqual([]);
      expect(tree.valuesOf('a')).toEqual([]);
      expect(tree.valuesOf(['a'])).toEqual([]);

      // we can use set with an ancestor because it's a distinct tree
      tree.set('b', { id: 'b' }, 'a');
      expect(tree.valuesOf(['a', 'b'])).toEqual([]);
      expect(tree.valuesOf('a|b')).toEqual([]);
    });

    test(`returns a flat values array of descendents when nested is false`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set('c', { id: 'c' });
      tree.set('b', { id: 'b' });
      tree.set('a', { id: 'a' });
      tree.set('d', { id: 'd' }, 'a');
      tree.set('e', { id: 'e' }, 'a');
      tree.set('f', { id: 'f' }, 'e');
      tree.set('g', { id: 'g' }, 'e');

      // note here you don't get the full node id paths
      expect(tree.valuesOf(['a'], true, false, 1)).toEqual([
        { id: 'a' },
        { id: 'd' },
        { id: 'e' },
      ]);

      expect(tree.valuesOf(['a'], false, false)).toEqual([
        { id: 'd' },
        { id: 'e' },
        { id: 'f' },
        { id: 'g' },
      ]);

      // full path
      expect(tree.valuesOf(['a', 'e'], false, false)).toEqual([
        { id: 'f' },
        { id: 'g' },
      ]);

      // or not full path
      expect(tree.valuesOf('e', false, false)).toEqual([
        { id: 'f' },
        { id: 'g' },
      ]);
    });

    test(`returns a nested [datum, values] array of descendents when nested is true`, () => {
      const tree = Tree.factory({ datum: { id: 'root' }, distinct: true });
      tree.set('c', { id: 'c' });
      tree.set('b', { id: 'b' });
      tree.set('a', { id: 'a' });
      tree.set('d', { id: 'd' }, 'a');
      tree.set('h', { id: 'h' }, 'd');
      tree.set('e', { id: 'e' }, 'a');
      tree.set('f', { id: 'f' }, 'e');
      tree.set('g', { id: 'g' }, 'e');

      expect(tree.valuesOf(['a'], true, true, 1)).toEqual([
        [
          { id: 'a' },
          [
            [{ id: 'd' }, []],
            [{ id: 'e' }, []],
          ],
        ],
      ]);

      expect(tree.valuesOf(['a'], false, true)).toEqual([
        [{ id: 'd' }, [[{ id: 'h' }, []]]],
        [
          { id: 'e' },
          [
            [{ id: 'f' }, []],
            [{ id: 'g' }, []],
          ],
        ],
      ]);

      expect(tree.valuesOf(['a', 'e'], false, true)).toEqual([
        [{ id: 'f' }, []],
        [{ id: 'g' }, []],
      ]);

      expect(tree.valuesOf('e', false, true)).toEqual([
        [{ id: 'f' }, []],
        [{ id: 'g' }, []],
      ]);

      expect(tree.valuesOf('root', true, true)).toEqual([
        [
          { id: 'root' },
          [
            [{ id: 'c' }, []],
            [{ id: 'b' }, []],
            [
              { id: 'a' },
              [
                [{ id: 'd' }, [[{ id: 'h' }, []]]],
                [
                  { id: 'e' },
                  [
                    [{ id: 'f' }, []],
                    [{ id: 'g' }, []],
                  ],
                ],
              ],
            ],
          ],
        ],
      ]);
    });
  });
});
