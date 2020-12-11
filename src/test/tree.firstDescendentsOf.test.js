import { Tree } from "../tree";

describe(`A tree's firstDescendentsOf method`, () => {
  test(`returns a flat array of [key, datum] whose keys match a provided path limited by a depth of 1`, () => {
    const tree = Tree.factory({ datum: { id: "root" }, distinct: true });

    expect(tree.firstDescendentsOf()).toEqual([]);
    expect(tree.firstDescendentsOf("root")).toEqual([]);
    expect(tree.firstDescendentsOf(["root"])).toEqual([]);

    tree.set("c", { id: "c" });
    tree.set("b", { id: "b" });
    tree.set("a", { id: "a" });
    tree.set("d", { id: "d" }, "a");
    tree.set(["a", "e"], { id: "e" });
    tree.set("f", { id: "f" }, "e");

    // some descendents
    expect(tree.firstDescendentsOf()).toEqual([
      ["c", { id: "c" }],
      ["b", { id: "b" }],
      ["a", { id: "a" }],
    ]);

    expect(tree.firstDescendentsOf("b")).toEqual([]);

    expect(tree.firstDescendentsOf(["a"])).toEqual([
      ["d", { id: "d" }],
      ["e", { id: "e" }],
    ]);

    tree.set(["a", "e", "g"], { id: "g" });
    tree.set(["a", "d", "h"], { id: "h" });

    expect(tree.firstDescendentsOf("e")).toEqual([
      ["f", { id: "f" }],
      ["g", { id: "g" }],
    ]);

    expect(tree.firstDescendentsOf("e")).toEqual([
      ["f", { id: "f" }],
      ["g", { id: "g" }],
    ]);

    expect(tree.firstDescendentsOf(["a", "e"])).toEqual([
      ["f", { id: "f" }],
      ["g", { id: "g" }],
    ]);

    expect(tree.firstDescendentsOf("e")).toEqual([
      ["f", { id: "f" }],
      ["g", { id: "g" }],
    ]);

    //- - - - - - - - - - - - - - - - - - - now with an indistict tree

    const ndTree = Tree.factory({ datum: { id: "root" }, distinct: false });
    // empty because inclusive is false;
    expect(ndTree.firstDescendentsOf()).toEqual([]);
    expect(ndTree.firstDescendentsOf("root")).toEqual([]);
    expect(ndTree.firstDescendentsOf(["root"])).toEqual([]);

    ndTree.set("c", { id: "c" });
    ndTree.set("b", { id: "b" });
    ndTree.set("a", { id: "a" });
    ndTree.set("a|d", { id: "d" }); // no ancestor on non distinct trees
    ndTree.set(["a", "e"], { id: "e" });
    ndTree.set("a|e|f", { id: "f" });

    // some descendents
    expect(ndTree.firstDescendentsOf()).toEqual([
      [["root", "c"], { id: "c" }],
      [["root", "b"], { id: "b" }],
      [["root", "a"], { id: "a" }],
    ]);

    expect(ndTree.firstDescendentsOf("b")).toEqual([]);

    expect(ndTree.firstDescendentsOf(["a"])).toEqual([
      [["root", "a", "d"], { id: "d" }],
      [["root", "a", "e"], { id: "e" }],
    ]);

    ndTree.set(["a", "e", "g"], { id: "g" });
    ndTree.set(["a", "d", "h"], { id: "h" });

    expect(ndTree.firstDescendentsOf("a|e")).toEqual([
      [["root", "a", "e", "f"], { id: "f" }],
      [["root", "a", "e", "g"], { id: "g" }],
    ]);

    expect(ndTree.firstDescendentsOf(["a", "e"])).toEqual([
      [["root", "a", "e", "f"], { id: "f" }],
      [["root", "a", "e", "g"], { id: "g" }],
    ]);
  });
});
