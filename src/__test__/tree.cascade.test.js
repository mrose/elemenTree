import { Tree } from '../tree';

describe(`The cascade method`, () => {
  // fn, path, inclusive
  test(`throws an error when node does not exist`, () => {
    const tree1 = Tree.factory();
    expect(() => tree1.cascade(undefined, ['a'], true)).toThrow();
  });

  test(`returns an object that can be used as a thenable`, () => {
    const add10 = ([k, datum]) => {
      if (!datum) return datum; // best practice: always guard!
      const { id, value } = datum;
      const v = value ? value + 10 : value;
      return [k, { id, value: v }];
    };
    const tree = Tree.factory({ distinct: false });
    expect(tree.cascade(add10, ['root'], false)).toBeInstanceOf(Object);
  });

  test(`function defaults to _.identity`);

  describe(`for trees which have non-distinct node Ids`, () => {
    describe(`where inclusive is false (default)`, () => {
      test(`iterate through a node's descendents`, () => {
        const returnUndefined = ([k, datum], tree) => {
          // console.log('do something');
          return undefined;
        };
        const tree = Tree.factory({ distinct: false });
        tree.set(['root'], { id: 'root', value: 1 });
        tree.set(['root', 'a'], { id: 'a', value: 2 });
        tree.set(['root', 'a', 'b'], { id: 'b', value: 3 });
        tree.set(['root', 'a', 'b', 'c'], { id: 'c', value: 4 });
        tree.set(['root', 'a', 'd'], { id: 'd', value: 5 });
        tree.set(['root', 'a', 'd', 'e'], { id: 'e', value: 6 });
        tree.set(['root', 'a', 'd', 'e', 'f'], { id: 'f', value: 7 });

        tree.cascade(returnUndefined, ['root', 'a', 'd'], false);
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
          { id: 'e', value: 6 },
        ]);
        expect(tree.get(['a', 'd', 'e', 'f'])).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 7 },
        ]);
      });
      test(`apply a function to a node's descendents`, () => {
        const add10 = ([k, datum], tree) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return [k, { id, value: v }];
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
      test(`simulate reducing behaviour on a node's descendents`, () => {
        function totalToRoot([k, datum], tree) {
          let [rk, rd] = tree.get(['root']);
          const id = rd.id;
          const value = rd.value + datum.value;
          return [rk, { id, value }];
        }

        const tree = Tree.factory({ distinct: false });
        tree.set(['root'], { id: 'root', value: 1 });
        tree.set(['root', 'a'], { id: 'a', value: 2 });
        tree.set(['root', 'a', 'b'], { id: 'b', value: 3 });
        tree.set(['root', 'a', 'b', 'c'], { id: 'c', value: 4 });
        tree.set(['root', 'a', 'd'], { id: 'd', value: 5 });
        tree.set(['root', 'a', 'd', 'e'], { id: 'e', value: 6 });
        tree.set(['root', 'a', 'd', 'e', 'f'], { id: 'f', value: 7 });

        tree.cascade(totalToRoot, ['root'], false);

        expect(tree.get(['root'])).toEqual([
          ['root'],
          { id: 'root', value: 28 },
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
          { id: 'e', value: 6 },
        ]);
        expect(tree.get(['a', 'd', 'e', 'f'])).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 7 },
        ]);
      });
    });
    describe(`where inclusive is true`, () => {
      test(`iterate through a node's descendents`, () => {
        const returnUndefined = ([k, datum], tree) => {
          // console.log('do something');
          return undefined;
        };
        const tree = Tree.factory({ distinct: false });
        tree.set(['root'], { id: 'root', value: 1 });
        tree.set(['root', 'a'], { id: 'a', value: 2 });
        tree.set(['root', 'a', 'b'], { id: 'b', value: 3 });
        tree.set(['root', 'a', 'b', 'c'], { id: 'c', value: 4 });
        tree.set(['root', 'a', 'd'], { id: 'd', value: 5 });
        tree.set(['root', 'a', 'd', 'e'], { id: 'e', value: 6 });
        tree.set(['root', 'a', 'd', 'e', 'f'], { id: 'f', value: 7 });

        tree.cascade(returnUndefined, ['root', 'a', 'd'], true);
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
          { id: 'e', value: 6 },
        ]);
        expect(tree.get(['a', 'd', 'e', 'f'])).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 7 },
        ]);
      });
      test(`applies a function to a node and its descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return [k, { id, value: v }];
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
      test(`simulate reducing behaviour on a node's descendents`, () => {
        function totalToRoot([k, datum], tree) {
          let [rk, rd] = tree.get(['root']);
          const id = rd.id;
          const value = rd.value + datum.value;
          return [rk, { id, value }];
        }

        const tree = Tree.factory({ distinct: false });
        tree.set(['root'], { id: 'root', value: 1 });
        tree.set(['root', 'a'], { id: 'a', value: 2 });
        tree.set(['root', 'a', 'b'], { id: 'b', value: 3 });
        tree.set(['root', 'a', 'b', 'c'], { id: 'c', value: 4 });
        tree.set(['root', 'a', 'd'], { id: 'd', value: 5 });
        tree.set(['root', 'a', 'd', 'e'], { id: 'e', value: 6 });
        tree.set(['root', 'a', 'd', 'e', 'f'], { id: 'f', value: 7 });

        tree.cascade(totalToRoot, ['root'], true);

        expect(tree.get(['root'])).toEqual([
          ['root'],
          { id: 'root', value: 29 },
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
          { id: 'e', value: 6 },
        ]);
        expect(tree.get(['a', 'd', 'e', 'f'])).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 7 },
        ]);
      });
    });
  });

  describe(`for trees which have distinct node Ids`, () => {
    describe(`where inclusive is false (default)`, () => {
      test(`iterate through a node's descendents`, () => {
        const returnUndefined = ([k, datum], tree) => {
          // console.log('do something');
          return undefined;
        };
        const tree = Tree.factory({ distinct: true });
        tree.set('root', { id: 'root', value: 1 });
        tree.set('a', { id: 'a', value: 2 });
        tree.set('b', { id: 'b', value: 3 }, 'a');
        tree.set('c', { id: 'c', value: 4 }, 'b');
        tree.set('d', { id: 'd', value: 5 }, 'a');
        tree.set('e', { id: 'e', value: 6 }, 'd');
        tree.set('f', { id: 'f', value: 7 }, 'e');

        tree.cascade(returnUndefined, 'd', false);

        expect(tree.get('root')).toEqual([['root'], { id: 'root', value: 1 }]);
        expect(tree.get('a')).toEqual([['root', 'a'], { id: 'a', value: 2 }]);
        expect(tree.get('b')).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get('c')).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get('d')).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 5 },
        ]);
        expect(tree.get('e')).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 6 },
        ]);
        expect(tree.get('f')).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 7 },
        ]);
      });
      test(`applies a function to a node's descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return [k, { id, value: v }];
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
        expect(tree.get('b')).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get('c')).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get('d')).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 5 },
        ]);
        expect(tree.get('e')).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 16 },
        ]);
        expect(tree.get('f')).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 17 },
        ]);
      });
      test(`simulate reducing behaviour on a node's descendents`, () => {
        function totalToRoot([k, datum], tree) {
          let [rk, rd] = tree.get(['root']);
          const id = rd.id;
          const value = rd.value + datum.value;
          return [rk, { id, value }];
        }

        const tree = Tree.factory({ distinct: true });
        tree.set('root', { id: 'root', value: 1 });
        tree.set('a', { id: 'a', value: 2 });
        tree.set('b', { id: 'b', value: 3 }, 'a');
        tree.set('c', { id: 'c', value: 4 }, 'b');
        tree.set('d', { id: 'd', value: 5 }, 'a');
        tree.set('e', { id: 'e', value: 6 }, 'd');
        tree.set('f', { id: 'f', value: 7 }, 'e');

        tree.cascade(totalToRoot, ['root'], false);

        expect(tree.get('root')).toEqual([['root'], { id: 'root', value: 28 }]);
        expect(tree.get('a')).toEqual([['root', 'a'], { id: 'a', value: 2 }]);
        expect(tree.get('b')).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get('c')).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get('d')).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 5 },
        ]);
        expect(tree.get('e')).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 6 },
        ]);
        expect(tree.get('f')).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 7 },
        ]);
      });
    });
    describe(`where inclusive is true`, () => {
      test(`iterate through a node's descendents`, () => {
        const returnUndefined = ([k, datum], tree) => {
          // console.log('do something');
          return undefined;
        };
        const tree = Tree.factory({ distinct: true });
        tree.set('root', { id: 'root', value: 1 });
        tree.set('a', { id: 'a', value: 2 });
        tree.set('b', { id: 'b', value: 3 }, 'a');
        tree.set('c', { id: 'c', value: 4 }, 'b');
        tree.set('d', { id: 'd', value: 5 }, 'a');
        tree.set('e', { id: 'e', value: 6 }, 'd');
        tree.set('f', { id: 'f', value: 7 }, 'e');

        tree.cascade(returnUndefined, 'd', true);

        expect(tree.get('root')).toEqual([['root'], { id: 'root', value: 1 }]);
        expect(tree.get('a')).toEqual([['root', 'a'], { id: 'a', value: 2 }]);
        expect(tree.get('b')).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get('c')).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get('d')).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 5 },
        ]);
        expect(tree.get('e')).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 6 },
        ]);
        expect(tree.get('f')).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 7 },
        ]);
      });
      test(`applies a function to a node and its descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return [k, { id, value: v }];
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
      test(`simulate reducing behaviour on a node's descendents`, () => {
        function totalToRoot([k, datum], tree) {
          let [rk, rd] = tree.get(['root']);
          const id = rd.id;
          const value = rd.value + datum.value;
          return [rk, { id, value }];
        }

        const tree = Tree.factory({ distinct: true });
        tree.set('root', { id: 'root', value: 1 });
        tree.set('a', { id: 'a', value: 2 });
        tree.set('b', { id: 'b', value: 3 }, 'a');
        tree.set('c', { id: 'c', value: 4 }, 'b');
        tree.set('d', { id: 'd', value: 5 }, 'a');
        tree.set('e', { id: 'e', value: 6 }, 'd');
        tree.set('f', { id: 'f', value: 7 }, 'e');

        tree.cascade(totalToRoot, ['root'], true);

        expect(tree.get('root')).toEqual([['root'], { id: 'root', value: 29 }]);
        expect(tree.get('a')).toEqual([['root', 'a'], { id: 'a', value: 2 }]);
        expect(tree.get('b')).toEqual([
          ['root', 'a', 'b'],
          { id: 'b', value: 3 },
        ]);
        expect(tree.get('c')).toEqual([
          ['root', 'a', 'b', 'c'],
          { id: 'c', value: 4 },
        ]);
        expect(tree.get('d')).toEqual([
          ['root', 'a', 'd'],
          { id: 'd', value: 5 },
        ]);
        expect(tree.get('e')).toEqual([
          ['root', 'a', 'd', 'e'],
          { id: 'e', value: 6 },
        ]);
        expect(tree.get('f')).toEqual([
          ['root', 'a', 'd', 'e', 'f'],
          { id: 'f', value: 7 },
        ]);
      });
    });
  });
});