"use strict";

var _tree = require("../src/tree");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

describe("The traverse method", function () {
  // fn, path, order
  test("throws an error when node does not exist", function () {
    var tree1 = _tree.Tree.factory();

    expect(function () {
      return tree1.traverse(undefined, ["a"]);
    }).toThrow();
  });
  test("throws an error when order is not one of \"asc\" or \"desc\"", function () {
    var tree = _tree.Tree.factory();

    expect(function () {
      return tree.traverse(undefined, ["root"], true);
    }).toThrow();
    expect(function () {
      return tree.traverse(undefined, ["root"]);
    }).toBeInstanceOf(Object);
    expect(function () {
      return tree.traverse(undefined, ["root"], "asc");
    }).toBeInstanceOf(Object);
    expect(function () {
      return tree.traverse(undefined, ["root"], "desc");
    }).toBeInstanceOf(Object);
  });
  test("function defaults to _.identity");
  describe("for trees which have non-distinct node Ids", function () {
    test("iterate through a node's path", function () {
      var returnUndefined = function returnUndefined(_ref, tree) {
        var _ref2 = _slicedToArray(_ref, 2),
            k = _ref2[0],
            datum = _ref2[1];

        // console.log('do something');
        return undefined;
      };

      var tree = _tree.Tree.factory({
        distinct: false
      });

      tree.set(["root"], {
        id: "root",
        value: 1
      });
      tree.set(["root", "a"], {
        id: "a",
        value: 2
      });
      tree.set(["root", "a", "b"], {
        id: "b",
        value: 3
      });
      tree.set(["root", "a", "b", "c"], {
        id: "c",
        value: 4
      });
      tree.set(["root", "a", "d"], {
        id: "d",
        value: 5
      });
      tree.set(["root", "a", "d", "e"], {
        id: "e",
        value: 6
      });
      tree.set(["root", "a", "d", "e", "f"], {
        id: "f",
        value: 7
      });
      tree.traverse(returnUndefined, ["root", "a", "d", "e", "f"]);
      expect(tree.get(["root"])).toEqual({
        id: "root",
        value: 1
      });
      expect(tree.get(["a"])).toEqual({
        id: "a",
        value: 2
      });
      expect(tree.get(["a", "b"])).toEqual({
        id: "b",
        value: 3
      });
      expect(tree.get(["a", "b", "c"])).toEqual({
        id: "c",
        value: 4
      });
      expect(tree.get(["a", "d"])).toEqual({
        id: "d",
        value: 5
      });
      expect(tree.get(["a", "d", "e"])).toEqual({
        id: "e",
        value: 6
      });
      expect(tree.get(["a", "d", "e", "f"])).toEqual({
        id: "f",
        value: 7
      });
    });
    test("apply a function to a node's path", function () {
      var add10 = function add10(_ref3, tree) {
        var _ref4 = _slicedToArray(_ref3, 2),
            k = _ref4[0],
            datum = _ref4[1];

        if (!datum) return datum; // best practice: always guard!

        datum.value += 10;
        return [k, datum];
      };

      var tree = _tree.Tree.factory({
        distinct: false
      });

      tree.set(["root"], {
        id: "root",
        value: 1
      });
      tree.set(["root", "a"], {
        id: "a",
        value: 2
      });
      tree.set(["root", "a", "b"], {
        id: "b",
        value: 3
      });
      tree.set(["root", "a", "b", "c"], {
        id: "c",
        value: 4
      });
      tree.set(["root", "a", "d"], {
        id: "d",
        value: 5
      });
      tree.set(["root", "a", "d", "e"], {
        id: "e",
        value: 6
      });
      tree.set(["root", "a", "d", "e", "f"], {
        id: "f",
        value: 7
      });
      tree.traverse(add10, ["a", "d", "e"]);
      expect(tree.get(["root"])).toEqual({
        id: "root",
        value: 11
      });
      expect(tree.get(["a"])).toEqual({
        id: "a",
        value: 12
      });
      expect(tree.get(["a", "b"])).toEqual({
        id: "b",
        value: 3
      });
      expect(tree.get(["a", "b", "c"])).toEqual({
        id: "c",
        value: 4
      });
      expect(tree.get(["a", "d"])).toEqual({
        id: "d",
        value: 15
      });
      expect(tree.get(["a", "d", "e"])).toEqual({
        id: "e",
        value: 16
      });
      expect(tree.get(["a", "d", "e", "f"])).toEqual({
        id: "f",
        value: 7
      });
    });
    test("simulate reducing behaviour on a node's path", function () {
      function totalToRoot(_ref5, tree) {
        var _ref6 = _slicedToArray(_ref5, 2),
            k = _ref6[0],
            datum = _ref6[1];

        var rd = tree.get(["root"]);
        rd.value += datum.value;
        return ["root", rd];
      }

      var tree = _tree.Tree.factory({
        distinct: false
      });

      tree.set(["root"], {
        id: "root",
        value: 1
      });
      tree.set(["root", "a"], {
        id: "a",
        value: 2
      });
      tree.set(["root", "a", "b"], {
        id: "b",
        value: 3
      });
      tree.set(["root", "a", "b", "c"], {
        id: "c",
        value: 4
      });
      tree.set(["root", "a", "d"], {
        id: "d",
        value: 5
      });
      tree.set(["root", "a", "d", "e"], {
        id: "e",
        value: 6
      });
      tree.set(["root", "a", "d", "e", "f"], {
        id: "f",
        value: 7
      });
      tree.traverse(totalToRoot, ["root", "a", "d"]); //(1 + 1 + 2 + 5 = 9)

      expect(tree.get(["root"])).toEqual({
        id: "root",
        value: 9
      });
      expect(tree.get(["a"])).toEqual({
        id: "a",
        value: 2
      });
      expect(tree.get(["a", "b"])).toEqual({
        id: "b",
        value: 3
      });
      expect(tree.get(["a", "b", "c"])).toEqual({
        id: "c",
        value: 4
      });
      expect(tree.get(["a", "d"])).toEqual({
        id: "d",
        value: 5
      });
      expect(tree.get(["a", "d", "e"])).toEqual({
        id: "e",
        value: 6
      });
      expect(tree.get(["a", "d", "e", "f"])).toEqual({
        id: "f",
        value: 7
      });
    });
  });
  describe("for trees which have distinct node Ids", function () {
    test("iterate through a node's path", function () {
      var visited = [];

      var returnUndefined = function returnUndefined(_ref7, tree) {
        var _ref8 = _slicedToArray(_ref7, 2),
            k = _ref8[0],
            datum = _ref8[1];

        visited.push(k);
        return undefined;
      };

      var tree = _tree.Tree.factory({
        distinct: true
      });

      tree.set("root", {
        id: "root",
        value: 1
      });
      tree.set("a", {
        id: "a",
        value: 2
      });
      tree.set("b", {
        id: "b",
        value: 3
      }, "a");
      tree.set("c", {
        id: "c",
        value: 4
      }, "b");
      tree.set("d", {
        id: "d",
        value: 5
      }, "a");
      tree.set("e", {
        id: "e",
        value: 6
      }, "d");
      tree.set("f", {
        id: "f",
        value: 7
      }, "e");
      tree.traverse(returnUndefined, "d", "desc");
      expect(visited).toEqual(["root", "a", "d"]);
      visited = [];
      tree.traverse(returnUndefined, "d", "asc");
      expect(visited).toEqual(["d", "a", "root"]);
      expect(tree.get("root")).toEqual({
        id: "root",
        value: 1
      });
      expect(tree.get("a")).toEqual({
        id: "a",
        value: 2
      });
      expect(tree.get("b")).toEqual({
        id: "b",
        value: 3
      });
      expect(tree.get("c")).toEqual({
        id: "c",
        value: 4
      });
      expect(tree.get("d")).toEqual({
        id: "d",
        value: 5
      });
      expect(tree.get("e")).toEqual({
        id: "e",
        value: 6
      });
      expect(tree.get("f")).toEqual({
        id: "f",
        value: 7
      });
    });
    test("applies a function to a node's path", function () {
      var add10 = function add10(_ref9) {
        var _ref10 = _slicedToArray(_ref9, 2),
            k = _ref10[0],
            datum = _ref10[1];

        if (!datum) return datum; // best practice: always guard!

        datum.value += 10;
        return [k, datum];
      };

      var tree = _tree.Tree.factory({
        distinct: true
      });

      tree.set("root", {
        id: "root",
        value: 1
      });
      tree.set("a", {
        id: "a",
        value: 2
      });
      tree.set("b", {
        id: "b",
        value: 3
      }, "a");
      tree.set("c", {
        id: "c",
        value: 4
      }, "b");
      tree.set("d", {
        id: "d",
        value: 5
      }, "a");
      tree.set("e", {
        id: "e",
        value: 6
      }, "d");
      tree.set("f", {
        id: "f",
        value: 7
      }, "e");
      tree.traverse(add10, "d");
      expect(tree.get("root")).toEqual({
        id: "root",
        value: 11
      });
      expect(tree.get("a")).toEqual({
        id: "a",
        value: 12
      });
      expect(tree.get("b")).toEqual({
        id: "b",
        value: 3
      });
      expect(tree.get("c")).toEqual({
        id: "c",
        value: 4
      });
      expect(tree.get("d")).toEqual({
        id: "d",
        value: 15
      });
      expect(tree.get("e")).toEqual({
        id: "e",
        value: 6
      });
      expect(tree.get("f")).toEqual({
        id: "f",
        value: 7
      });
    });
    test("simulate reducing behaviour on a node's path", function () {
      function totalToRoot(_ref11, tree) {
        var _ref12 = _slicedToArray(_ref11, 2),
            k = _ref12[0],
            datum = _ref12[1];

        var rd = tree.get(["root"]);
        rd.value += datum.value;
        return ["root", rd];
      }

      var tree = _tree.Tree.factory({
        distinct: true
      });

      tree.set("root", {
        id: "root",
        value: 1
      });
      tree.set("a", {
        id: "a",
        value: 2
      });
      tree.set("b", {
        id: "b",
        value: 3
      }, "a");
      tree.set("c", {
        id: "c",
        value: 4
      }, "b");
      tree.set("d", {
        id: "d",
        value: 5
      }, "a");
      tree.set("e", {
        id: "e",
        value: 6
      }, "d");
      tree.set("f", {
        id: "f",
        value: 7
      }, "e");
      tree.traverse(totalToRoot, "e"); //(1+2+3+4+5 = 15)

      expect(tree.get("root")).toEqual({
        id: "root",
        value: 15
      });
      expect(tree.get("a")).toEqual({
        id: "a",
        value: 2
      });
      expect(tree.get("b")).toEqual({
        id: "b",
        value: 3
      });
      expect(tree.get("c")).toEqual({
        id: "c",
        value: 4
      });
      expect(tree.get("d")).toEqual({
        id: "d",
        value: 5
      });
      expect(tree.get("e")).toEqual({
        id: "e",
        value: 6
      });
      expect(tree.get("f")).toEqual({
        id: "f",
        value: 7
      });
    });
  });
});