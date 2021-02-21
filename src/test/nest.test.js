import { Tree, nest, p2s, validate } from "../tree";
import curry from "lodash/fp/curry";
import { add, filter, flow, identity, isNil, map, min, partition, size, startsWith } from "lodash/fp";

function setupTree(distinct=false) {
    const tree = Tree.factory({ distinct });
    tree.set(["root"], { id: "root", value: 1 });
    tree.set(["root", "a"], { id: "a", value: 2 });
    tree.set(["root", "a", "b"], { id: "b", value: 3 });
    tree.set(["root", "a", "b", "c"], { id: "c", value: 4 });
    tree.set(["root", "a", "d"], { id: "d", value: 5 });
    tree.set(["root", "a", "d", "e"], { id: "e", value: 6 });
    tree.set(["root", "a", "d", "e", "f"], { id: "f", value: 7 });
    tree.set(["root", "m"], { id: "m", value: 8 });
    tree.set(["root", "m", "n"], { id: "n", value: 9 });
    tree.set(["root", "m", "n", "o"], { id: "o", value: 10 });
    tree.set(["root", "m", "n", "o", "p"], { id: "p", value: 11 });
    return tree;
}

// (tree, keyFormatter, only, entries)
describe(`the nest function normally returns an array of nested keys, values, or entries`, () => {

  test(`throws an error when only is not undefined, "keys", or "values"`, () => {
    const tree = setupTree();
    expect(() => nest(tree, undefined, "foo", [])).toThrow();
  });

  test(`when the entries argument is an empty array , returns it`, () => {
    const tree = Tree.factory({ distinct:false });
    const expected = [];
    const received = nest(tree, undefined, undefined, []);
    expect(received).toEqual(expected);
  });

  test(`returns an array of a single entry when only is undefined`, () => {
    const tree = Tree.factory();

    const expected = [
        [["root"], { id: "root", value: 1 },[] ]
    ];
    const entries = [
        [["root"], { id: "root", value: 1 }]
    ];

    const received = nest(tree, undefined, undefined, entries);
    expect(received).toEqual(expected);
  });

  test(`returns an array of a single entry when only is "keys"`, () => {
    const tree = Tree.factory();

    const expected = [
        [["root"], [] ]
    ];
    const entries = [
        [["root"], { id: "root", value: 1 }]
    ];

    const received = nest(tree, undefined, 'keys', entries);
    expect(received).toEqual(expected);
  });

  test(`returns an array of a single entry when only is "values"`, () => {
    const tree = Tree.factory();

    const expected = [
        [{ id: "root", value: 1 }, [] ]
    ];
    const entries = [
        [["root"], { id: "root", value: 1 }]
    ];

    const received = nest(tree, undefined, 'values', entries);
    expect(received).toEqual(expected);
  });

  test(`returns a nested array of a single entry with a two levels of two descendents`, () => {
    const tree = Tree.factory();

    const expected = [
        [
          ["root"], { id: "root", value: 1 },
            [
              [ ["root", "a"], { id: "a", value: 2 }, [
                  [["root", "a", "d"], { id: "d", value: 4 }, []],
                  [["root", "a", "e"], { id: "e", value: 5 }, []]
              ] ],
              [ ["root", "b"], { id: "b", value: 3 }, [
                [ ["root", "b", "f"], { id: "f", value: 6 }, []],
                [["root", "b", "g"], { id: "g", value: 7 }, []]
              ] ],
              ]
          ]
      ];

    const entries = [
        [["root"], { id: "root", value: 1 }],
        [["root", "a"], { id: "a", value: 2 }],
        [["root", "b"], { id: "b", value: 3 }],
        [["root", "a", "d"], { id: "d", value: 4 }],
        [["root", "a", "e"], { id: "e", value: 5 }],
        [["root", "b", "f"], { id: "f", value: 6 }],
        [["root", "b", "g"], { id: "g", value: 7 }],
      ];

    const received = nest(tree, undefined, undefined, entries);
    expect(received).toEqual(expected);
  });

  test(`returns a nested array of a single key with a two levels of two descendents`, () => {
    const tree = Tree.factory();

    const expected = [
        [
          ["root"],
            [
              [ ["root", "a"], [
                  [["root", "a", "d"], []],
                  [["root", "a", "e"], []]
              ] ],
              [ ["root", "b"], [
                [ ["root", "b", "f"], []],
                [["root", "b", "g"], []]
              ] ],
              ]
          ]
      ];

    const entries = [
        [["root"], { id: "root", value: 1 }],
        [["root", "a"], { id: "a", value: 2 }],
        [["root", "b"], { id: "b", value: 3 }],
        [["root", "a", "d"], { id: "d", value: 4 }],
        [["root", "a", "e"], { id: "e", value: 5 }],
        [["root", "b", "f"], { id: "f", value: 6 }],
        [["root", "b", "g"], { id: "g", value: 7 }],
      ];

    const received = nest(tree, undefined, 'keys', entries);
    expect(received).toEqual(expected);
  });

  test(`returns a nested array of a single value with a two levels of two descendents`, () => {
    const tree = Tree.factory();

    const expected = [
        [
          { id: "root", value: 1 },
            [
              [ { id: "a", value: 2 }, [
                  [{ id: "d", value: 4 }, []],
                  [{ id: "e", value: 5 }, []]
              ] ],
              [{ id: "b", value: 3 }, [
                [{ id: "f", value: 6 }, []],
                [{ id: "g", value: 7 }, []]
              ] ],
              ]
          ]
      ];

    const entries = [
        [["root"], { id: "root", value: 1 }],
        [["root", "a"], { id: "a", value: 2 }],
        [["root", "b"], { id: "b", value: 3 }],
        [["root", "a", "d"], { id: "d", value: 4 }],
        [["root", "a", "e"], { id: "e", value: 5 }],
        [["root", "b", "f"], { id: "f", value: 6 }],
        [["root", "b", "g"], { id: "g", value: 7 }],
      ];

    const received = nest(tree, undefined, 'values', entries);
    expect(received).toEqual(expected);
  });

});
