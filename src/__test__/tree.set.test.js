import { Tree } from '../tree';

describe(`The set method`, () => {
  describe(`for trees which have distinct node Ids (default)`, () => {
    test(`throws an error when path argument is not a string or array`, () => {
      const tree = Tree.factory({ distinct: true });
      expect(() => tree.set(42, { id: 'b', value: 3 })).toThrow();
      expect(() => tree.set({ id: 'b', value: 3 })).toThrow();
    });

    test(`throws an error when any element in a path argument is empty`, () => {
      const tree = Tree.factory({ distinct: true });
      expect(() => tree.set([''], { id: 'b', value: 3 })).toThrow();
      expect(() => tree.set(['a', 'b', ''], { id: 'b', value: 3 })).toThrow();
      expect(() => tree.set('a|b||d', { id: 'b', value: 3 })).toThrow();
    });

    test(`throws an error when ancestor argument is not a simple string or single element array`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set('a', { id: 'a', value: 2 });
      expect(() => tree.set('b', { id: 'b', value: 3 }, 0)).toThrow();
      expect(() => tree.set('c', { id: 'c', value: 4 }, ['a', 'b'])).toThrow();
      expect(() => tree.set('c', { id: 'c', value: 4 }, { a: 'b' })).toThrow();
      tree.set('b', { id: 'b', value: 3 }, 'a');
      tree.set('c', { id: 'c', value: 4 }, ['a']);
    });

    test(`throws an error when ancestor argument is used and path argument is not a simple string or single element array`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set('a', { id: 'a', value: 2 });
      expect(() => tree.set('b|c', { id: 'c', value: 4 }, 'a')).toThrow();
      expect(() =>
        tree.set(['b', 'c'], { id: 'c', value: 4 }, ['a'])
      ).toThrow();
    });

    test(`throws an error when ancestor argument is used but ancestor does not exist`, () => {
      const tree = Tree.factory({ distinct: true });
      const ancestor = 'b';
      tree.set('a', { id: 'a', value: 2 });
      expect(() => tree.set('c', { id: 'c', value: 4 }, ancestor)).toThrow(
        `ancestor ${ancestor} does not exist`
      );
    });

    test(`throws an error when ancestor argument is used and the path id already exists for a different ancestor`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set('a', { id: 'a', value: 1 });
      tree.set('b', { id: 'b', value: 2 }, 'a');
      tree.set('c', { id: 'c', value: 3 }, 'b');
      tree.set('d', { id: 'd', value: 4 }, 'c');

      expect(() => tree.set('d', { id: 'd', value: 4 }, 'b')).toThrow();

      expect(() => tree.set('a', { id: 'a', value: 11 }, 'a')).toThrow();
    });

    test(`throws an error when any intermediate path would cause a duplicate id`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set('a', { id: 'a', value: 1 });
      tree.set('b', { id: 'b', value: 2 }, 'a');
      tree.set('c', { id: 'c', value: 3 }, 'b');

      expect(() => tree.set(['c', 'e'], { id: 'e', value: 5 })).toThrow();

      expect(() => tree.set(['f', 'f', 'f'], { id: 'f', value: 6 })).toThrow();

      expect(() =>
        tree.set(['root', 'root', 'root'], { id: 'root', value: 0 })
      ).toThrow();
    });

    test(`appends a node`, () => {
      const tree = Tree.factory({ distinct: true });
      let rtrn;

      // root, if you need it
      rtrn = tree.set('', { id: 'root', value: 0 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get('')).toEqual({ id: 'root', value: 0 });
      tree.clear();

      rtrn = tree.set([], { id: 'root', value: 0 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get([])).toEqual({ id: 'root', value: 0 });
      tree.clear();

      rtrn = tree.set('root', { id: 'root', value: 0 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get('root')).toEqual({ id: 'root', value: 0 });
      tree.clear();

      rtrn = tree.set(['root'], { id: 'root', value: 0 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get(['root'])).toEqual({ id: 'root', value: 0 });
      tree.clear();

      // straight, no chaser
      rtrn = tree.set('a', { id: 'a', value: 1 });
      expect(rtrn).toEqual(['root', 'a']);
      expect(tree.get(['a'])).toEqual({ id: 'a', value: 1 });
      tree.clear();

      // straight, alternate syntax
      rtrn = tree.set(['a'], { id: 'a', value: 1 });
      expect(rtrn).toEqual(['root', 'a']);
      expect(tree.get(['a'])).toEqual({ id: 'a', value: 1 });

      // now add others using ancestor
      // this is the preferred syntax for distinct trees
      rtrn = tree.set('b', { id: 'b', value: 2 }, 'a');
      expect(rtrn).toEqual(['root', 'a', 'b']);
      expect(tree.get(['b'])).toEqual({ id: 'b', value: 2 });

      rtrn = tree.set('c', { id: 'c', value: 3 }, 'b');
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get(['c'])).toEqual({ id: 'c', value: 3 });
      tree.clear();

      // deeply nested, intermediate nodes' datum is set to undefined
      rtrn = tree.set(['a', 'b', 'c'], { id: 'c', value: 3 });
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get(['a'])).toEqual(undefined);
      expect(tree.get(['b'])).toEqual(undefined);
      expect(tree.get(['c'])).toEqual({ id: 'c', value: 3 });
      tree.clear();

      // alternate syntax
      // deeply nested, intermediate nodes' datum is set to undefined
      rtrn = tree.set('a|b|c', { id: 'c', value: 3 });
      // the full node id path is always returned to you
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get('a')).toEqual(undefined);
      expect(tree.get('b')).toEqual(undefined);
      expect(tree.get('c')).toEqual({ id: 'c', value: 3 });
    });

    test(`updates a node`, () => {
      const tree = Tree.factory({ distinct: true });
      let rtrn;

      // root, if you need it
      rtrn = tree.set('', { id: 'root', value: 0 });
      rtrn = tree.set('', { id: 'root', value: 10 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get('')).toEqual({ id: 'root', value: 10 });

      rtrn = tree.set([], { id: 'root', value: 20 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get([])).toEqual({ id: 'root', value: 20 });

      rtrn = tree.set('root', { id: 'root', value: 30 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get('root')).toEqual({ id: 'root', value: 30 });

      rtrn = tree.set(['root'], { id: 'root', value: 40 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get(['root'])).toEqual({ id: 'root', value: 40 });
      tree.clear();

      rtrn = tree.set('a|b|c', { id: 'c', value: 3 });

      // using full path is always ok
      rtrn = tree.set(['a', 'b', 'c'], { id: 'c', value: 13 });
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get('c')).toEqual({ id: 'c', value: 13 });

      // alternate syntax
      rtrn = tree.set('a|b|c', { id: 'c', value: 23 });
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get('c')).toEqual({ id: 'c', value: 23 });

      // to update the original you no longer need ancestor
      rtrn = tree.set('c', { id: 'c', value: 33 });
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get('c')).toEqual({ id: 'c', value: 33 });

      // but update should work anyway
      rtrn = tree.set('c', { id: 'c', value: 43 }, 'b');
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get('c')).toEqual({ id: 'c', value: 43 });
    });
  });

  describe(`for trees which have non-distinct node Ids`, () => {
    test(`throws an error when ancestor argument is used`, () => {
      const tree = Tree.factory({ distinct: false });
      tree.set('a', { id: 'a', value: 1 });
      expect(() => {
        tree.set('b', { id: 'b', value: 2 }, 'a');
      }).toThrow();
    });

    test(`throws an error when path argument is not a string or array`, () => {
      const tree = Tree.factory({ distinct: false });
      expect(() => tree.set(42, { id: 'b', value: 3 })).toThrow();
      expect(() => tree.set({ id: 'b', value: 3 })).toThrow();
    });

    test(`throws an error when any element in a path argument is empty`, () => {
      const tree = Tree.factory({ distinct: false });
      expect(() => tree.set([''], { id: 'b', value: 3 })).toThrow();
      expect(() => tree.set(['a', 'b', ''], { id: 'b', value: 3 })).toThrow();
      expect(() => tree.set('a|b||d', { id: 'b', value: 3 })).toThrow();
    });

    test(`appends a node`, () => {
      const tree = Tree.factory({ distinct: false });
      let rtrn;

      // root, if you need it
      rtrn = tree.set('', { id: 'root', value: 0 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get('')).toEqual({ id: 'root', value: 0 });
      tree.clear();

      rtrn = tree.set([], { id: 'root', value: 0 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get([])).toEqual({ id: 'root', value: 0 });
      tree.clear();

      rtrn = tree.set('root', { id: 'root', value: 0 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get('root')).toEqual({ id: 'root', value: 0 });
      tree.clear();

      rtrn = tree.set(['root'], { id: 'root', value: 0 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get(['root'])).toEqual({ id: 'root', value: 0 });
      tree.clear();

      rtrn = tree.set('a', { id: 'a', value: 1 });
      expect(rtrn).toEqual(['root', 'a']);
      expect(tree.get(['a'])).toEqual({ id: 'a', value: 1 });
      tree.clear();

      rtrn = tree.set(['a'], { id: 'a', value: 1 });
      expect(rtrn).toEqual(['root', 'a']);
      expect(tree.get(['a'])).toEqual({ id: 'a', value: 1 });

      // now add others
      // this is the preferred syntax for non-distinct trees
      rtrn = tree.set(['a', 'b'], { id: 'b', value: 2 });
      expect(rtrn).toEqual(['root', 'a', 'b']);
      expect(tree.get(['a', 'b'])).toEqual({ id: 'b', value: 2 });
      tree.clear();

      // deeply nested, intermediate nodes' datum is set to undefined
      rtrn = tree.set(['a', 'b', 'c'], { id: 'c', value: 3 });
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get(['a'])).toEqual(undefined);
      expect(tree.get(['a', 'b'])).toEqual(undefined);
      expect(tree.get(['a', 'b', 'c'])).toEqual({ id: 'c', value: 3 });
      tree.clear();

      // alternate syntax
      // deeply nested, intermediate nodes' datum is set to undefined
      rtrn = tree.set('a|b|c', { id: 'c', value: 3 });
      // the full node id path is always returned to you
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get(['a'])).toEqual(undefined);
      expect(tree.get(['a', 'b'])).toEqual(undefined);
      expect(tree.get(['a', 'b', 'c'])).toEqual({ id: 'c', value: 3 });
      tree.clear();
    });

    test(`updates a node`, () => {
      const tree = Tree.factory({ distinct: false });
      let rtrn;

      // root, if you need it
      rtrn = tree.set('', { id: 'root', value: 0 });
      rtrn = tree.set('', { id: 'root', value: 10 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get('')).toEqual({ id: 'root', value: 10 });

      rtrn = tree.set([], { id: 'root', value: 20 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get([])).toEqual({ id: 'root', value: 20 });

      rtrn = tree.set('root', { id: 'root', value: 30 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get('root')).toEqual({ id: 'root', value: 30 });

      rtrn = tree.set(['root'], { id: 'root', value: 40 });
      expect(rtrn).toEqual(['root']);
      expect(tree.get(['root'])).toEqual({ id: 'root', value: 40 });
      tree.clear();

      rtrn = tree.set('a|b|c', { id: 'c', value: 3 });

      // using full path is always ok
      rtrn = tree.set(['a', 'b', 'c'], { id: 'c', value: 13 });
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get('a|b|c')).toEqual({ id: 'c', value: 13 });

      // alternate syntax
      // for kicks we used a duplicate node id
      rtrn = tree.set('a|b|a', { id: 'c', value: 23 });
      expect(rtrn).toEqual(['root', 'a', 'b', 'a']);
      expect(tree.get(['a', 'b', 'a'])).toEqual({ id: 'c', value: 23 });

      rtrn = tree.set(['a', 'b', 'c'], { id: 'c', value: 33 });
      expect(rtrn).toEqual(['root', 'a', 'b', 'c']);
      expect(tree.get(['a', 'b', 'c'])).toEqual({ id: 'c', value: 33 });
    });
  });
});
