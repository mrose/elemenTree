import { Tree, descendents } from "../tree";
import curry from "lodash/fp/curry";


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

// (inclusive, depth, tree, path)
describe(`the descendents function normally returns an array`, () => {
    test(`throws an error when depth is not an integer`, () => {
        const tree = setupTree();
        expect(() => descendents(true, "depth", tree, ["a"])).toThrow();
      });
    
      test(`throws an error when depth is zero and inclusive is false`, () => {
        const tree = setupTree();
        expect(() => descendents(false, 0, tree, ["a"])).toThrow();
        expect(descendents(true, 0, tree, ["a"])).toBeInstanceOf(Array);
      });
    
      // n.b. inclusive argument can be any truthy or falsey. not explicitly boolean

      test(`when the path argument does not refer to an existing node, returns an empty array`, () => {
        const tree = setupTree();
        const t1 = descendents(false, undefined, tree, ["z"]);
        expect(t1).toEqual([]);
      });

      test(`when no descendents exist and the inclusive argument is false, returns an empty array `, () => {
        const tree = setupTree();
        const t2 = descendents(false, undefined, tree, ["root", "a", "b", "c"]);
        expect(t2).toEqual([]);
      });

      test(`when no descendents exist and the inclusive argument is true, returns a single entry in the array`, () => {
        const tree = setupTree();
        const t3 = descendents(true, undefined, tree, ["root", "a", "b", "c"]);
        expect(t3).toEqual([[["root", "a", "b", "c"], { id: "c", value: 4 }]]);
      });

    test(`when the inclusive argument is false and the depth argument is undefined, returns all descendents in the array`, () => {
        const tree = setupTree();
        const t4 = descendents(false, undefined, tree, ["root", "a", "b"]);
        expect(t4).toEqual([[["root", "a", "b", "c"], { id: "c", value: 4 }]]);

        const t5 = descendents(false, undefined, tree, ["root", "a"]);
        expect(t5).toEqual([
            [["root", "a", "b"], { id: "b", value: 3 }],
            [["root", "a", "b", "c"], { id: "c", value: 4 }],
            [["root", "a", "d"], { id: "d", value: 5 }],
            [["root", "a", "d", "e"], { id: "e", value: 6 }],
            [["root", "a", "d", "e", "f"], { id: "f", value: 7 }],
        ]);
    });

    test(`when the inclusive argument is true and the depth argument is undefined, returns the entry for the path and all descendents in the array`, () => {
        const tree = setupTree();
        const t6 = descendents(true, undefined, tree, ["root", "a", "b"]);
        expect(t6).toEqual([
            [["root", "a", "b"], { id: "b", value: 3 }],
            [["root", "a", "b", "c"], { id: "c", value: 4 }]
        ]);

        const t7 = descendents(true, undefined, tree, ["root", "a"]);
        expect(t7).toEqual([
            [["root", "a"], { id: "a", value: 2 }],
            [["root", "a", "b"], { id: "b", value: 3 }],
            [["root", "a", "b", "c"], { id: "c", value: 4 }],
            [["root", "a", "d"], { id: "d", value: 5 }],
            [["root", "a", "d", "e"], { id: "e", value: 6 }],
            [["root", "a", "d", "e", "f"], { id: "f", value: 7 }],
        ]);
    });

    test(`when the inclusive argument is false and the depth argument is 1, returns all descendents at the depth in the array`, () => {
        const tree = setupTree();
        const t8 = descendents(false, 1, tree, ["root", "a"]);
        expect(t8).toEqual([
            [["root", "a", "b"], { id: "b", value: 3 }],
            [["root", "a", "d"], { id: "d", value: 5 }],
        ]);
    });

    test(`when the inclusive argument is true and the depth argument is 1, returns the entry for the path and all descendents at the depth in the array`, () => {
        const tree = setupTree();
        const t9 = descendents(true, 1, tree, ["root", "a"]);
        expect(t9).toEqual([
            [["root", "a"], { id: "a", value: 2 }],
            [["root", "a", "b"], { id: "b", value: 3 }],
            [["root", "a", "d"], { id: "d", value: 5 }],
        ]);
    });
});


