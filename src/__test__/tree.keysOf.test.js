import { Tree } from '../tree';

describe(`The keysOf method`, () => {
  // path, inclusive, nested, depth
  test(`throws an error when depth is not an integer`, () => {
    const tree = Tree.factory({ distinct: false });
    tree.set(['a'], { id: 'a' });
    expect(() => tree.keysOf(['a'], true, false, 'depth')).toThrow();
  });

  test(`throws an error when depth is zero and inclusive is false`, () => {
    const tree = Tree.factory({ distinct: false });
    tree.set(['a'], { id: 'a' });
    expect(() => tree.keysOf(['a'], false, false, 0)).toThrow();
    expect(tree.keysOf(['a'], true, false, 0)).toBeInstanceOf(Array);
  });

  // TODO: throws when path is invalid, inclusive is invalid, nested is invalid
  describe(`for trees which have non-distinct node Ids`, () => {
    test(`returns an empty keys array when the path does not refer to an existing node`, () => {
      const tree = Tree.factory({ distinct: false });
      tree.set(['a'], { id: 'a' });
      expect(tree.keysOf(['b'])).toEqual([]);
    });

    test(`returns an empty keys array when no descendents exist and inclusive is false`, () => {
      const tree = Tree.factory({ distinct: false });
      expect(tree.keysOf()).toEqual([]);
      expect(tree.keysOf('root')).toEqual([]);
      expect(tree.keysOf(['root'])).toEqual([]);

      tree.set(['a'], { id: 'a' });
      expect(tree.keysOf('a')).toEqual([]);
      expect(tree.keysOf('a')).toEqual([]);
      expect(tree.keysOf(['a'])).toEqual([]);

      tree.set(['a', 'b'], { id: 'b' });
      expect(tree.keysOf(['a', 'b'])).toEqual([]);
      expect(tree.keysOf('a|b')).toEqual([]);
    });

    test(`returns a single entry when no descendents exist and inclusive is true`, () => {
      const tree = Tree.factory({ datum: { id: 'root' }, distinct: false });
      expect(tree.keysOf(undefined, true)).toEqual([['root']]);
      expect(tree.keysOf('root', true)).toEqual([['root']]);
      expect(tree.keysOf(['root'], true)).toEqual([['root']]);

      tree.set(['a'], { id: 'a' });
      expect(tree.keysOf('a', true)).toEqual([['root', 'a']]);
      expect(tree.keysOf('a', true)).toEqual([['root', 'a']]);
      expect(tree.keysOf(['a'], true)).toEqual([['root', 'a']]);

      tree.set(['a', 'b'], { id: 'b' });
      expect(tree.keysOf(['a', 'b'], true)).toEqual([['root', 'a', 'b']]);
      expect(tree.keysOf('a|b', true)).toEqual([['root', 'a', 'b']]);
    });

    test(`returns a flat keys array of descendents when nested is false`, () => {
      const tree = Tree.factory({ distinct: false });
      tree.set('c', { id: 'c' });
      tree.set('b', { id: 'b' });
      tree.set('a', { id: 'a' });
      tree.set(['a', 'd'], { id: 'd' });
      tree.set(['a', 'e'], { id: 'e' });
      tree.set(['a', 'e', 'f'], { id: 'f' });
      tree.set(['a', 'e', 'g'], { id: 'g' });

      expect(tree.keysOf(['a'], true, false, 1)).toEqual([
        ['a'],
        ['a', 'd'],
        ['a', 'e'],
      ]);

      expect(tree.keysOf(['a'], false, false)).toEqual([
        ['a', 'd'],
        ['a', 'e'],
        ['a', 'e', 'f'],
        ['a', 'e', 'g'],
      ]);

      expect(tree.keysOf(['a', 'e'], false, false)).toEqual([
        ['a', 'e', 'f'],
        ['a', 'e', 'g'],
      ]);

      tree.show_root = 'yes';
      expect(tree.keysOf(['a'], true, false, 1)).toEqual([
        ['root', 'a'],
        ['root', 'a', 'd'],
        ['root', 'a', 'e'],
      ]);

      expect(tree.keysOf(['a'], false, false)).toEqual([
        ['root', 'a', 'd'],
        ['root', 'a', 'e'],
        ['root', 'a', 'e', 'f'],
        ['root', 'a', 'e', 'g'],
      ]);

      expect(tree.keysOf(['a', 'e'], false, false)).toEqual([
        ['root', 'a', 'e', 'f'],
        ['root', 'a', 'e', 'g'],
      ]);
    });

    test(`returns a nested [key, keys] array of descendents when nested is true`, () => {
      const tree = Tree.factory({ datum: { id: 'root' }, distinct: false });
      tree.set('c', { id: 'c' });
      tree.set('b', { id: 'b' });
      tree.set('a', { id: 'a' });
      tree.set(['a', 'd'], { id: 'd' });
      tree.set(['a', 'd', 'h'], { id: 'h' });
      tree.set(['a', 'e'], { id: 'e' });
      tree.set(['a', 'e', 'f'], { id: 'f' });
      tree.set(['a', 'e', 'g'], { id: 'g' });

      expect(tree.keysOf(['a'], true, true, 1)).toEqual([
        [
          ['root', 'a'],
          [
            [['root', 'a', 'd'], []],
            [['root', 'a', 'e'], []],
          ],
        ],
      ]);

      expect(tree.keysOf(['a'], false, true)).toEqual([
        [['root', 'a', 'd'], [[['root', 'a', 'd', 'h'], []]]],
        [
          ['root', 'a', 'e'],
          [
            [['root', 'a', 'e', 'f'], []],
            [['root', 'a', 'e', 'g'], []],
          ],
        ],
      ]);

      expect(tree.keysOf(['a', 'e'], false, true)).toEqual([
        [['root', 'a', 'e', 'f'], []],
        [['root', 'a', 'e', 'g'], []],
      ]);

      expect(tree.keysOf('root', true, true)).toEqual([
        [
          ['root'],
          [
            [['root', 'c'], []],
            [['root', 'b'], []],
            [
              ['root', 'a'],
              [
                [['root', 'a', 'd'], [[['root', 'a', 'd', 'h'], []]]],
                [
                  ['root', 'a', 'e'],
                  [
                    [['root', 'a', 'e', 'f'], []],
                    [['root', 'a', 'e', 'g'], []],
                  ],
                ],
              ],
            ],
          ],
        ],
      ]);

      tree.show_root = 'no';
      expect(tree.keysOf('root', true, true)).toEqual([
        [[],[
            [['c'], []],
            [['b'], []],
            [
              ['a'],
              [
                [['a', 'd'], [[['a', 'd', 'h'], []]]],
                [
                  ['a', 'e'],
                  [
                    [['a', 'e', 'f'], []],
                    [['a', 'e', 'g'], []],
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
    test(`returns an empty keys array when the path does not refer to an existing node`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set(['a'], { id: 'a' });
      expect(tree.keysOf(['b'])).toEqual([]);
    });

    test(`returns an empty keys array when no descendents exist and inclusive is false`, () => {
      const tree = Tree.factory({ distinct: true });
      expect(tree.keysOf()).toEqual([]);
      expect(tree.keysOf('root')).toEqual([]);
      expect(tree.keysOf(['root'])).toEqual([]);

      tree.set(['a'], { id: 'a' });
      expect(tree.keysOf('a')).toEqual([]);
      expect(tree.keysOf('a')).toEqual([]);
      expect(tree.keysOf(['a'])).toEqual([]);

      // we can use set with an ancestor because it's a distinct tree
      tree.set('b', { id: 'b' }, 'a');
      expect(tree.keysOf(['a', 'b'])).toEqual([]);
      expect(tree.keysOf('a|b')).toEqual([]);
    });

    test(`returns a flat keys array of descendents when nested is false`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set('c', { id: 'c' });
      tree.set('b', { id: 'b' });
      tree.set('a', { id: 'a' });
      tree.set('d', { id: 'd' }, 'a');
      tree.set('e', { id: 'e' }, 'a');
      tree.set('f', { id: 'f' }, 'e');
      tree.set('g', { id: 'g' }, 'e');

      // note here you don't get the full node id paths
      expect(tree.keysOf(['a'], true, false, 1)).toEqual(['a', 'd', 'e']);

      expect(tree.keysOf(['a'], false, false)).toEqual(['d', 'e', 'f', 'g']);

      // full path
      expect(tree.keysOf(['a', 'e'], false, false)).toEqual(['f', 'g']);

      // or not full path
      expect(tree.keysOf('e', false, false)).toEqual(['f', 'g']);
    });

    test(`returns a nested [key, keys] array of descendents when nested is true`, () => {
      const tree = Tree.factory({ datum: { id: 'root' }, distinct: true });
      tree.set('c', { id: 'c' });
      tree.set('b', { id: 'b' });
      tree.set('a', { id: 'a' });
      tree.set('d', { id: 'd' }, 'a');
      tree.set('h', { id: 'h' }, 'd');
      tree.set('e', { id: 'e' }, 'a');
      tree.set('f', { id: 'f' }, 'e');
      tree.set('g', { id: 'g' }, 'e');

      expect(tree.keysOf(['a'], true, true, 1)).toEqual([
        [
          'a',
          [
            ['d', []],
            ['e', []],
          ],
        ],
      ]);

      expect(tree.keysOf(['a'], false, true)).toEqual([
        ['d', [['h', []]]],
        [
          'e',
          [
            ['f', []],
            ['g', []],
          ],
        ],
      ]);

      expect(tree.keysOf(['a', 'e'], false, true)).toEqual([
        ['f', []],
        ['g', []],
      ]);

      expect(tree.keysOf('e', false, true)).toEqual([
        ['f', []],
        ['g', []],
      ]);

      expect(tree.keysOf('root', true, true)).toEqual([
        [
          'root',
          [
            ['c', []],
            ['b', []],
            [
              'a',
              [
                ['d', [['h', []]]],
                [
                  'e',
                  [
                    ['f', []],
                    ['g', []],
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
