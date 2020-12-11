import { Tree } from "../tree";

describe(`A tree's clear method`, () => {
  test(`removes all nodes`, () => {
    const tree = Tree.factory();
    expect(tree.size).toBe(1);
    tree.set(["a"]);
    expect(tree.size).toBe(2);
    tree.set(["b"]);
    tree.set(["c"], "baz");
    tree.set(["d", "e"], "qux");
    // it's 6 because we also write the 'd' node & root is included
    expect(tree.size).toBe(6);
    tree.clear();
    expect(tree.size).toBe(1);
  });
});
