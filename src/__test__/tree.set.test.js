import { Tree } from '../tree';

describe(`A tree's set method`, () => {
  test(`appends or updates a node when distinct is false`, () => {
    const tree = Tree.factory({ distinct: false });
    let rtrn;
    // setting datum on the tree's root node
    rtrn = tree.set('', 'data1');
    expect(rtrn).toEqual(['root']);
    expect(tree.get()).toEqual([['root'], 'data1']);

    expect(tree.set([], ['data2'])).toEqual(['root']);
    expect(tree.get([])).toEqual([['root'], ['data2']]);

    expect(tree.set('root', { data: '3' })).toEqual(['root']);
    expect(tree.get('root')).toEqual([['root'], { data: '3' }]);

    // preferred, because it's explicit:
    expect(tree.set(['root'], { data: '4' })).toEqual(['root']);
    expect(tree.get(['root'])).toEqual([['root'], { data: '4' }]);

    rtrn = tree.set(['a'], { foo: 'bar' });
    expect(rtrn).toEqual(['root', 'a']);
    expect(tree.get('a')).toEqual([['root', 'a'], { foo: 'bar' }]);
    expect(tree.has('a')).toBeTruthy();

    rtrn = tree.set(['a', 'b'], { id: 42 });
    expect(rtrn).toEqual(['root', 'a', 'b']);
    expect(tree.get(['a', 'b'])).toEqual([['root', 'a', 'b'], { id: 42 }]);
    expect(tree.get('a|b')).toEqual([['root', 'a', 'b'], { id: 42 }]);

    // reset a node's datum
    rtrn = tree.set(['a', 'b'], { id: 43 });
    expect(rtrn).toEqual(['root', 'a', 'b']);
    expect(tree.get(['a', 'b'])).toEqual([['root', 'a', 'b'], { id: 43 }]);
    expect(tree.get('a|b')).toEqual([['root', 'a', 'b'], { id: 43 }]);

    tree.set('a|c', 89);
    expect(tree.get('a|c')).toEqual([['root', 'a', 'c'], 89]);
    rtrn = tree.set('a|b|c|d', { id: 99 });
    expect(rtrn).toEqual(['root', 'a', 'b', 'c', 'd']);
    expect(tree.get(['a', 'b', 'c', 'd'])).toEqual([
      ['root', 'a', 'b', 'c', 'd'],
      { id: 99 },
    ]);
  });

  test(`appends or updates a node when distinct is true`, () => {
    const tree = Tree.factory({ distinct: true });
    let rtrn;

    rtrn = tree.set('a|b|c|d', { id: 'd' });
    expect(rtrn).toEqual(['root', 'a', 'b', 'c', 'd']);
    expect(tree.get(['a', 'b', 'c', 'd'])).toEqual([
      ['root', 'a', 'b', 'c', 'd'],
      { id: 'd' },
    ]);

    // when distinct is true you get automatic ancestry

    // ancestry applies
    rtrn = tree.set('f', { id: 8443 }, 'a');
    expect(rtrn).toEqual(['root', 'a', 'f']);

    // the full node id path is always returned to you
    rtrn = tree.set(['e'], { id: 44 }, ['d']);
    expect(rtrn).toEqual(['root', 'a', 'b', 'c', 'd', 'e']);

    // path must be a simple string or single element array when using ancestry
    expect(() => tree.set(['x', 'y'], { id: 8551 }, 'root')).toThrow();

    // ancestor must be a simple string or single element array
    expect(() => tree.set(['x'], { id: 8551 }, ['root', 'a'])).toThrow();

    // throws when ancestor does not exist
    expect(() => tree.set('f', { id: 8443 }, 'qq')).toThrow();
  });
});
