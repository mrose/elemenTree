import { Tree } from '../tree';

describe(`The someOf method`, () => {
  test(`throws on an invalid depth argument`, () => {
    // someOf(fn, path, inclusive, depth,)
    const hasAnId = (val) => (val ? val.id && val.id.length : false);
    const tree = Tree.factory();

    expect(() => tree.someOf(hasAnId, ['a'], true, 'depth')).toThrow();
    expect(() => tree.someOf(hasAnId, ['a'], true, 0)).toThrow();
  });

  // TODO: throws on invalid fn (new truthy fn default), inclusive

  describe(`for trees which have non-distinct node Ids`, () => {
    describe(`where inclusive is true`, () => {
      test(`tests whether at least one qualifying datum passes the test implemented by the provided function`, () => {
        const hasAnId = (val) => (val ? val.id && val.id.length : false);
        const tree = Tree.factory({ distinct: false });
        tree.set(['c'], { id: 'c' });
        tree.set(['c', 'd'], { aintGotNoId: true });
        tree.set(['c', 'd', 'g'], { id: 'g' });
        tree.set(['b'], { id: 'b' });
        tree.set(['a'], { id: 'a' });
        tree.set(['a', 'd'], { id: 'd' });
        tree.set(['a', 'e'], { id: 'e' });
        tree.set(['a', 'e', 'f'], { id: 'f' });
        tree.set(['h'], { aintGotNoId: true });
        tree.set(['h', 'i'], { aintGotNoId: true });
        tree.set(['h', 'i', 'j'], { aintGotNoId: true });

        //expect(tree.someOf('', true)).toBe(false);
        expect(tree.someOf(hasAnId, ['root'], true)).toBe(true);

        // all depths
        expect(tree.someOf(hasAnId, ['c'], true)).toBe(true);

        expect(tree.someOf(hasAnId, ['a'], true)).toBe(true);
        expect(tree.someOf(hasAnId, ['a', 'e'], true)).toBe(true);
        expect(tree.someOf(hasAnId, ['a', 'e', 'f'], true)).toBe(true);

        expect(tree.someOf(hasAnId, ['h'], true)).toBe(false);

        // depth
        expect(tree.someOf(hasAnId, ['c'], true, 1)).toBe(true);
        expect(tree.someOf(hasAnId, ['c'], true, 2)).toBe(true);

        expect(tree.someOf(hasAnId, ['a', 'e'], true, 1)).toBe(true);
        expect(tree.someOf(hasAnId, ['a', 'e'], true, 2)).toBe(true);
        expect(tree.someOf(hasAnId, ['root'], true, 1)).toBe(true);
        expect(tree.someOf(hasAnId, ['root'], true, 2)).toBe(true);

        expect(tree.someOf(hasAnId, ['h'], true, 1)).toBe(false);
        expect(tree.someOf(hasAnId, ['h'], true, 2)).toBe(false);
        expect(tree.someOf(hasAnId, ['h'], true, 99999)).toBe(false);
      });
    });

    describe(`where inclusive is false (default)`, () => {
      test(`tests whether at least one qualifying datum passes the test implemented by the provided function`, () => {
        const hasAnId = (val) => (val ? val.id && val.id.length : false);
        const tree = Tree.factory({ distinct: false });

        expect(tree.someOf(hasAnId, ['root'], false)).toBe(false);

        tree.set(['c'], { id: 'c' });
        tree.set(['c', 'd'], { aintGotNoId: true });
        tree.set(['b'], { id: 'b' });
        tree.set(['a'], { id: 'a' });
        tree.set(['a', 'd'], { id: 'd' });
        tree.set(['a', 'e'], { id: 'e' });
        tree.set(['a', 'e', 'f'], { id: 'f' });
        tree.set(['h'], { aintGotNoId: true });
        tree.set(['h', 'i'], { aintGotNoId: true });
        tree.set(['h', 'i', 'j'], { aintGotNoId: true });

        expect(tree.someOf(hasAnId, '', false)).toBe(true);
        expect(tree.someOf(hasAnId, ['root'], false)).toBe(true);

        // all depths
        expect(tree.someOf(hasAnId, ['c'], false)).toBe(false);

        expect(tree.someOf(hasAnId, ['a'], false)).toBe(true);
        expect(tree.someOf(hasAnId, ['a', 'e'], false)).toBe(true);
        // empty set returns FALSE
        expect(tree.someOf(hasAnId, ['a', 'e', 'f'], false)).toBe(false);

        expect(tree.someOf(hasAnId, ['h'], false)).toBe(false);

        // depth
        expect(tree.someOf(hasAnId, ['c'], false, 1)).toBe(false);
        expect(tree.someOf(hasAnId, ['c'], false, 99999)).toBe(false);

        expect(tree.someOf(hasAnId, ['a', 'e'], false, 1)).toBe(true);
        expect(tree.someOf(hasAnId, ['a', 'e'], false, 2)).toBe(true);
        expect(tree.someOf(hasAnId, ['root'], false, 1)).toBe(true);
        expect(tree.someOf(hasAnId, ['root'], false, 2)).toBe(true);
      });
    });
  });

  describe(`for trees which have distinct node Ids`, () => {
    describe(`where inclusive is true`, () => {
      test(`tests whether at least one qualifying datum passes the test implemented by the provided function`, () => {
        const hasAnId = (val) => (val ? val.id && val.id.length : false);
        const tree = Tree.factory({ distinct: true });

        expect(tree.someOf(hasAnId, 'root', true)).toBe(false);

        tree.set('c', { id: 'c' });
        // you can use full path format if you prefer
        tree.set(['c', 'g'], { aintGotNoId: true });
        tree.set('b', { id: 'b' });
        tree.set('a', { id: 'a' });
        tree.set('d', { id: 'd' }, 'a');
        tree.set('e', { id: 'e' });
        tree.set('f', { id: 'f' }, 'e');
        tree.set('h', { aintGotNoId: true });
        tree.set('i', { aintGotNoId: true }, 'h');
        tree.set('j', { aintGotNoId: true }, 'i');

        expect(tree.someOf(undefined, '', true)).toBe(true);
        expect(tree.someOf(hasAnId, 'root', true)).toBe(true);

        // all depths
        expect(tree.someOf(hasAnId, 'c', true)).toBe(true);

        expect(tree.someOf(hasAnId, 'a', true)).toBe(true);
        expect(tree.someOf(hasAnId, 'e', true)).toBe(true);
        expect(tree.someOf(hasAnId, 'f', true)).toBe(true);

        expect(tree.someOf(hasAnId, 'g', true)).toBe(false);
        expect(tree.someOf(hasAnId, 'h', true)).toBe(false);

        // depth
        expect(tree.someOf(hasAnId, 'c', true, 1)).toBe(true);
        expect(tree.someOf(hasAnId, 'c', true, 99999)).toBe(true);
        expect(tree.someOf(hasAnId, 'e', true, 1)).toBe(true);
        expect(tree.someOf(hasAnId, 'e', true, 2)).toBe(true);
        expect(tree.someOf(hasAnId, 'root', true, 1)).toBe(true);
        expect(tree.someOf(hasAnId, 'root', true, 2)).toBe(true);

        expect(tree.someOf(hasAnId, 'h', true, 1)).toBe(false);
        expect(tree.someOf(hasAnId, 'h', true, 2)).toBe(false);
      });
    });

    describe(`where inclusive is false (default)`, () => {
      test(`tests whether at least one qualifying datum passes the test implemented by the provided function`, () => {
        const hasAnId = (val) => (val ? val.id && val.id.length : false);
        const tree = Tree.factory({ distinct: true });
        // n.b. empty sets return FALSE
        expect(tree.someOf(hasAnId, ['root'], false)).toBe(false);

        tree.set('c', { id: 'c' });
        tree.set('g', { aintGotNoId: true }, 'c');
        tree.set('b', { id: 'b' });
        tree.set('a', { id: 'a' });
        tree.set('d', { id: 'd' }, 'a');
        tree.set('e', { id: 'e' }, 'a');
        tree.set('f', { id: 'f' }, 'e');
        tree.set('h', { aintGotNoId: true });
        tree.set('i', { aintGotNoId: true }, 'h');
        tree.set('j', { aintGotNoId: true }, 'i');

        expect(tree.someOf(hasAnId, '', false)).toBe(true);
        expect(tree.someOf(hasAnId, 'root', false)).toBe(true);

        // all depths
        expect(tree.someOf(hasAnId, 'c', false)).toBe(false);

        expect(tree.someOf(hasAnId, 'a', false)).toBe(true);
        expect(tree.someOf(hasAnId, 'e', false)).toBe(true);
        // another empty set returns FALSE
        expect(tree.someOf(hasAnId, 'f', false)).toBe(false);

        expect(tree.someOf(hasAnId, 'h', false)).toBe(false);

        // depth
        expect(tree.someOf(hasAnId, 'c', false, 1)).toBe(false);
        expect(tree.someOf(hasAnId, 'c', false, 2)).toBe(false);
        expect(tree.someOf(hasAnId, 'c', false, 99999)).toBe(false);

        expect(tree.someOf(hasAnId, 'e', false, 1)).toBe(true);
        expect(tree.someOf(hasAnId, 'e', false, 2)).toBe(true);
        expect(tree.someOf(hasAnId, 'root', false, 1)).toBe(true);
        expect(tree.someOf(hasAnId, 'root', false, 2)).toBe(true);
      });
    });
  });
});
