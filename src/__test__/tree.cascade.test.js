import { Tree } from '../tree';

describe(`The cascade method`, () => {
  // fn, path, inclusive
  test(`throws an error when node does not exist`, () => {
    const tree = Tree.factory();
    expect(() => tree.cascade(undefined, ['a'], true)).toThrow();
  });

  test(`returns an object that can be used as a thenable`, () => {
    const add10 = ([k, datum]) => {
      if (!datum) return datum; // best practice: always guard!
      const { id, value } = datum;
      const v = value ? value + 10 : value;
      return { id, value: v };
    };
    const tree = Tree.factory({ distinct: false });
    expect(tree.cascade(add10, ['root'], false)).toBeInstanceOf(Object);
  });

  describe(`for trees which have non-distinct node Ids`, () => {
    describe(`where inclusive is false (default)`, () => {
      test(`applies a function to a node and its descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return { id, value: v };
        };
        const tree = Tree.factory({ distinct: false });
        tree.set(['root'], { id: 'root', value: 1 });
        tree.set(['root', 'a'], { id: 'a', value: 2 });
        tree.set(['root', 'a', 'b'], { id: 'b', value: 3 });
        tree.set(['root', 'a', 'b', 'c'], { id: 'c', value: 4 });
        tree.set(['root', 'a', 'd'], { id: 'd', value: 5 });
        tree.set(['root', 'a', 'd', 'e'], { id: 'e', value: 6 });
        tree.set(['root', 'a', 'd', 'e', 'f'], { id: 'f', value: 7 });

        tree.cascade(add10, ['root', 'a', 'd'], false);
        expect(tree.get(['root'])).toEqual([
          ['root'],
          { id: 'root', value: 1 },
        ]);
        expect(tree.get(['a'])).toEqual([['root', 'a'], { id: 'a', value: 2 }]);
        expect(tree.get(['a', 'b'])).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get(['a', 'b', 'c'])).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get(['a', 'd'])).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 5 },
        ]);
        expect(tree.get(['a', 'd', 'e'])).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 16 },
        ]);
        expect(tree.get(['a', 'd', 'e', 'f'])).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 17 },
        ]);
      });
    });
    describe(`where inclusive is true`, () => {
      test(`applies a function to a node and its descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return { id, value: v };
        };
        const tree = Tree.factory({ distinct: false });
        tree.set(['root'], { id: 'root', value: 1 });
        tree.set(['a'], { id: 'a', value: 2 });
        tree.set(['a', 'b'], { id: 'b', value: 3 });
        tree.set(['a', 'b', 'c'], { id: 'c', value: 4 });
        tree.set(['a', 'd'], { id: 'd', value: 5 });
        tree.set(['a', 'd', 'e'], { id: 'e', value: 6 });
        tree.set(['a', 'd', 'e', 'f'], { id: 'f', value: 7 });

        tree.cascade(add10, ['root', 'a', 'd'], true);
        expect(tree.get(['root'])).toEqual([
          ['root'],
          { id: 'root', value: 1 },
        ]);
        expect(tree.get(['a'])).toEqual([['root', 'a'], { id: 'a', value: 2 }]);
        expect(tree.get(['a', 'b'])).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get(['a', 'b', 'c'])).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get(['a', 'd'])).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 15 },
        ]);
        expect(tree.get(['a', 'd', 'e'])).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 16 },
        ]);
        expect(tree.get(['a', 'd', 'e', 'f'])).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 17 },
        ]);
      });
    });
  });

  describe(`for trees which have distinct node Ids`, () => {
    describe(`where inclusive is false (default)`, () => {
      test(`applies a function to a node and its descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return { id, value: v };
        };
        const tree = Tree.factory({ distinct: true });
        tree.set('root', { id: 'root', value: 1 });
        tree.set('a', { id: 'a', value: 2 });
        tree.set('b', { id: 'b', value: 3 }, 'a');
        tree.set('c', { id: 'c', value: 4 }, 'b');
        tree.set('d', { id: 'd', value: 5 }, 'a');
        tree.set('e', { id: 'e', value: 6 }, 'd');
        tree.set('f', { id: 'f', value: 7 }, 'e');

        tree.cascade(add10, 'd', false);
        expect(tree.get('root')).toEqual([['root'], { id: 'root', value: 1 }]);
        expect(tree.get('a')).toEqual([['root', 'a'], { id: 'a', value: 2 }]);
        expect(tree.get(['a', 'b'])).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get(['a', 'b', 'c'])).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get(['a', 'd'])).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 5 },
        ]);
        expect(tree.get(['a', 'd', 'e'])).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 16 },
        ]);
        expect(tree.get(['a', 'd', 'e', 'f'])).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 17 },
        ]);
      });
    });
    describe(`where inclusive is true`, () => {
      test(`applies a function to a node and its descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return { id, value: v };
        };
        const tree = Tree.factory({ distinct: true });
        tree.set('root', { id: 'root', value: 1 });
        tree.set('a', { id: 'a', value: 2 });
        tree.set('b', { id: 'b', value: 3 }, 'a');
        tree.set('c', { id: 'c', value: 4 }, 'b');
        tree.set('d', { id: 'd', value: 5 }, 'a');
        tree.set('e', { id: 'e', value: 6 }, 'd');
        tree.set('f', { id: 'f', value: 7 }, 'e');

        tree.cascade(add10, 'd', true);
        expect(tree.get('root')).toEqual([['root'], { id: 'root', value: 1 }]);
        expect(tree.get('a')).toEqual([['root', 'a'], { id: 'a', value: 2 }]);
        expect(tree.get(['a', 'b'])).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get(['a', 'b', 'c'])).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get(['a', 'd'])).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 15 },
        ]);
        expect(tree.get(['a', 'd', 'e'])).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 16 },
        ]);
        expect(tree.get(['a', 'd', 'e', 'f'])).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 17 },
        ]);
      });
    });
  });
});
