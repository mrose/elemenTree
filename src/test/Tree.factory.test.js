import { Tree } from "../tree";

describe(`A tree's static factory method`, () => {
  test(`should be used to create a new tree`, () => {
    const tree = Tree.factory();
    expect(tree).toBeInstanceOf(Tree);
    expect(tree.pathStringDelimiter).toBe("|");
    expect(tree.rootNodeId).toBe("root");
  });

  test(`may be provided a root node id which defaults to "root"`, () => {
    const tree0 = Tree.factory();
    expect(tree0.rootNodeId).toBe("root");
    const tree1 = Tree.factory({ rootNodeId: "Larry" });
    expect(tree1.rootNodeId).toBe("Larry");
  });

  test(`may be provided a path string delimiter which defaults to "|"`, () => {
    const tree0 = Tree.factory();
    expect(tree0.pathStringDelimiter).toEqual("|");
    const tree1 = Tree.factory({ pathStringDelimiter: "_" });
    expect(tree1.pathStringDelimiter).toBe("_");
  });

  test(`may be provided with data for the root node`, () => {
    const tree0 = Tree.factory();
    expect(tree0.get()).toEqual(undefined);
    expect(tree0.get("root")).toEqual(undefined);
    expect(tree0.get(["root"])).toEqual(undefined);

    const tree1 = Tree.factory({ datum: "foo" });
    expect(tree1.get()).toEqual("foo");
    expect(tree1.get("root")).toEqual("foo");
    expect(tree1.get(["root"])).toEqual("foo");

    const tree2 = Tree.factory({ datum: { foo: "bar" } });
    expect(tree2.get()).toEqual({ foo: "bar" });
    expect(tree2.get("root")).toEqual({ foo: "bar" });
    expect(tree2.get(["root"])).toEqual({ foo: "bar" });
  });
});
