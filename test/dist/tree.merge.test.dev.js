"use strict";

var _tree = require("../src/tree");

describe("The merge method", function () {
  test("throws an error when a non distinct (source) tree is merged with a distinct tree (target)", function () {
    var targetTree = _tree.Tree.factory({
      distinct: true
    });

    var sourceTree = _tree.Tree.factory({
      distinct: false
    });

    expect(function () {
      return targetTree.merge(sourceTree).toThrow();
    });
  });
  test("merges a (source) tree into another (target) tree", function () {
    var targetTree = _tree.Tree.factory({
      distinct: false
    });

    targetTree.set(["a"], {
      id: "a",
      value: 1
    });
    targetTree.set(["a", "b"], {
      id: "b",
      value: 2
    });
    targetTree.set(["a", "b", "c"], {
      id: "c",
      value: 3
    });
    targetTree.set(["a", "b", "c", "d"], {
      id: "d",
      value: 4
    });

    var sourceTree = _tree.Tree.factory({
      distinct: true
    });

    sourceTree.set("a", {
      id: "a",
      value: 11
    });
    sourceTree.set("b", {
      id: "b",
      value: 12
    }, "a");
    sourceTree.set("x", {
      id: "x",
      value: 24
    });
    sourceTree.set("y", {
      id: "y",
      value: 25
    }, "x");
    targetTree.merge(sourceTree);
    expect(targetTree.get(["a"])).toEqual({
      id: "a",
      value: 11
    });
    expect(targetTree.get("a|b")).toEqual({
      id: "b",
      value: 12
    });
    expect(targetTree.get(["a", "b", "c"])).toEqual({
      id: "c",
      value: 3
    });
    expect(targetTree.get(["a", "b", "c", "d"])).toEqual({
      id: "d",
      value: 4
    });
    expect(targetTree.get(["x"])).toEqual({
      id: "x",
      value: 24
    });
    expect(targetTree.get(["x", "y"])).toEqual({
      id: "y",
      value: 25
    });
  });
});