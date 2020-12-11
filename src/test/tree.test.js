import { Tree } from "../tree";

describe(`tree properties`, () => {
  test(`has a depth property`, () => {
    const tree = Tree.factory({ root_node_id: ["root"] });
    // root node is included
    expect(tree.depth).toBe(1);
    tree.set("a", { id: 0, name: "foo" });
    expect(tree.depth).toBe(2);
    tree.set(["a", "b", "c", "d"]);
    expect(tree.depth).toBe(5);
  });

  test(`has a hasDescendents property`, () => {
    const tree = Tree.factory();
    expect(tree.hasDescendents).toBe(false);
    tree.set("a", { id: 0 });
    expect(tree.hasDescendents).toBe(true);
  });

  test(`has a rootNodePath property`, () => {
    const tree0 = Tree.factory();
    expect(tree0.rootNodePath).toEqual(["root"]);
    expect(tree0.get("")).toEqual(undefined);
    expect(tree0.get(["root"])).toEqual(undefined);

    const tree1 = Tree.factory({ root_node_id: "qux" });
    expect(tree1.rootNodePath).toEqual(["qux"]);
    expect(tree1.get("")).toEqual(undefined);
    expect(tree1.get(["qux"])).toEqual(undefined);
  });

  test(`has a size property`, () => {
    const tree = Tree.factory();
    expect(tree.size).toEqual(1);
    tree.set(["a"]);
    tree.set(["b"]);
    tree.set(["c"]);
    expect(tree.size).toEqual(4);
  });
});
