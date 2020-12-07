"use strict";

var _tree = require("../src/tree");

describe("A tree's static factory method", function () {
  test("should be used to create a new tree", function () {
    var tree = _tree.Tree.factory();

    expect(tree).toBeInstanceOf(_tree.Tree);
    expect(tree.path_string_delimiter).toBe("|");
    expect(tree.root_node_id).toBe("root");
  });
  test("may be provided a root node id which defaults to \"root\"", function () {
    var tree0 = _tree.Tree.factory();

    expect(tree0.root_node_id).toBe("root");

    var tree1 = _tree.Tree.factory({
      root_node_id: "Larry"
    });

    expect(tree1.root_node_id).toBe("Larry");
  });
  test("may be provided a path string delimiter which defaults to \"|\"", function () {
    var tree0 = _tree.Tree.factory();

    expect(tree0.path_string_delimiter).toEqual("|");

    var tree1 = _tree.Tree.factory({
      path_string_delimiter: "_"
    });

    expect(tree1.path_string_delimiter).toBe("_");
  });
  test("may be provided with data for the root node", function () {
    var tree0 = _tree.Tree.factory();

    expect(tree0.get()).toEqual(undefined);
    expect(tree0.get("root")).toEqual(undefined);
    expect(tree0.get(["root"])).toEqual(undefined);

    var tree1 = _tree.Tree.factory({
      datum: "foo"
    });

    expect(tree1.get()).toEqual("foo");
    expect(tree1.get("root")).toEqual("foo");
    expect(tree1.get(["root"])).toEqual("foo");

    var tree2 = _tree.Tree.factory({
      datum: {
        foo: "bar"
      }
    });

    expect(tree2.get()).toEqual({
      foo: "bar"
    });
    expect(tree2.get("root")).toEqual({
      foo: "bar"
    });
    expect(tree2.get(["root"])).toEqual({
      foo: "bar"
    });
  });
});