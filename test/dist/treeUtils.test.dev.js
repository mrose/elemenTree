"use strict";

var _tree = require("../src/tree");

var _treeUtils = require("../src/treeUtils");

describe("tree utilities", function () {
  test.skip("coerce() coerces delimited strings, simple strings, and arrays to path arrays", function () {
    var tree = _tree.Tree.factory(); // standard coercion converts strings to path arrays
    // an empty or undefined argument refers to the root
    // usage below is not preferred because it is not explicit


    expect((0, _treeUtils.coerce)(tree)).toEqual(["root"]);
    expect((0, _treeUtils.coerce)(tree)).toBeInstanceOf(Array); // use delimited strings or path arrays

    expect((0, _treeUtils.coerce)(tree, "root")).toEqual(["root"]); // below usage is preferred:

    expect((0, _treeUtils.coerce)(tree, ["root"])).toEqual(["root"]);
    expect((0, _treeUtils.coerce)(tree, "foo")).toEqual(["root", "foo"]);
    expect((0, _treeUtils.coerce)(tree, ["foo"])).toEqual(["root", "foo"]);
    expect((0, _treeUtils.coerce)(tree, "foo|bar")).toEqual(["root", "foo", "bar"]);
    expect((0, _treeUtils.coerce)(tree, ["foo", "bar"])).toEqual(["root", "foo", "bar"]); // this won't work:

    expect(function () {
      return (0, _treeUtils.coerce)(tree, {
        foo: "bar"
      });
    }).toThrow(); // standard coercions are applied first.

    tree.set(["a", "b", "c"], {
      id: 42,
      color: "blue"
    });
  });
  test.skip("hasRootDatum() returns true when the root datum is not undefined", function () {
    var tree = _tree.Tree.factory();

    expect((0, _treeUtils.hasRootDatum)(tree)).toBeFalsy();
    tree.set("root", "foo");
    expect((0, _treeUtils.hasRootDatum)(tree)).toBeTruthy();
  });
  test.skip("p2s() converts a path to a delimited string", function () {
    var tree = _tree.Tree.factory();

    expect((0, _treeUtils.p2s)(tree, ["a", "b", "c"])).toEqual("a|b|c");
    expect((0, _treeUtils.p2s)(tree, undefined)).toEqual("");
  });
  test.skip("p2228t() ", function () {
    var tree0 = _tree.Tree.factory({
      distinct: true
    });

    var tree1 = _tree.Tree.factory({
      distinct: false
    });

    expect((0, _treeUtils.p2228t)(tree0, "a|b|c")).toEqual();
    expect((0, _treeUtils.p2228t)(tree1, "a|b|c")).toEqual();
  });
  test.skip("s2p() converts a delimited string to a path", function () {
    var tree = _tree.Tree.factory({
      path_string_delimiter: ":"
    });

    expect((0, _treeUtils.s2p)(tree, "a:b:c")).toEqual(["a", "b", "c"]);
  });
  test.skip("setIntermediates()  ", function () {});
});