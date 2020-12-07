"use strict";

var _tree = require("../src/tree");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

describe("The cascade method", function () {
  // fn, path, inclusive
  test("throws an error when node does not exist", function () {
    var tree1 = _tree.Tree.factory();

    expect(function () {
      return tree1.cascade(undefined, ["a"], true);
    }).toThrow();
  });
  test.skip("function defaults to _.identity", function () {});
  describe("for trees which have non-distinct node Ids", function () {
    describe("where inclusive is false (default)", function () {
      test("iterate through a node's descendents", function () {
        var visited = [];

        var returnUndefined = function returnUndefined(_ref, tree) {
          var _ref2 = _slicedToArray(_ref, 2),
              k = _ref2[0],
              datum = _ref2[1];

          visited.push(k);
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
        }); // show_root = auto and should be true since root datum is defined.

        tree.cascade(returnUndefined, ["root", "a", "d"], false);
        expect(visited).toEqual([["root", "a", "d", "e"], ["root", "a", "d", "e", "f"]]);
        visited = [];
        tree.cascade(returnUndefined, ["a", "d"], false);
        expect(visited).toEqual([["root", "a", "d", "e"], ["root", "a", "d", "e", "f"]]); // show root = auto so is false

        tree.set(["root"], undefined);
        visited = [];
        tree.cascade(returnUndefined, ["a", "d"], false);
        expect(visited).toEqual([["a", "d", "e"], ["a", "d", "e", "f"]]);
        visited = []; // if you're not using root you probably wouldnt' do the below

        tree.cascade(returnUndefined, ["root", "a", "d"], false);
        expect(visited).toEqual([["a", "d", "e"], ["a", "d", "e", "f"]]);
        tree.set(["root"], {
          id: "root",
          value: 1
        });
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
      test("apply a function to a node's descendents", function () {
        var add10 = function add10(_ref3, tree) {
          var _ref4 = _slicedToArray(_ref3, 2),
              k = _ref4[0],
              datum = _ref4[1];

          if (!datum) return datum; // best practice: always guard!

          var id = datum.id,
              value = datum.value;
          var v = value ? value + 10 : value;
          return [k, {
            id: id,
            value: v
          }];
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
        tree.cascade(add10, ["root", "a", "d"], false);
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
          value: 16
        });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({
          id: "f",
          value: 17
        });
      });
      test("simulate reducing behaviour on a node's descendents", function () {
        function totalToRoot(_ref5, tree) {
          var _ref6 = _slicedToArray(_ref5, 2),
              k = _ref6[0],
              datum = _ref6[1];

          var rd = tree.get(["root"]);
          rd.value = rd.value + datum.value;
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
        tree.cascade(totalToRoot, ["root"], false);
        expect(tree.get(["root"])).toEqual({
          id: "root",
          value: 28
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
    describe("where inclusive is true", function () {
      test("iterate through a node's descendents", function () {
        var visited = [];

        var returnUndefined = function returnUndefined(_ref7, tree) {
          var _ref8 = _slicedToArray(_ref7, 2),
              k = _ref8[0],
              datum = _ref8[1];

          visited.push(k);
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
        tree.cascade(returnUndefined, ["root", "a", "d"], true);
        expect(visited).toEqual([["root", "a", "d"], ["root", "a", "d", "e"], ["root", "a", "d", "e", "f"]]);
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
      test("applies a function to a node and its descendents", function () {
        var add10 = function add10(_ref9) {
          var _ref10 = _slicedToArray(_ref9, 2),
              k = _ref10[0],
              datum = _ref10[1];

          if (!datum) return datum; // best practice: always guard!

          var id = datum.id,
              value = datum.value;
          var v = value ? value + 10 : value;
          return [k, {
            id: id,
            value: v
          }];
        };

        var tree = _tree.Tree.factory({
          distinct: false
        });

        tree.set(["root"], {
          id: "root",
          value: 1
        });
        tree.set(["a"], {
          id: "a",
          value: 2
        });
        tree.set(["a", "b"], {
          id: "b",
          value: 3
        });
        tree.set(["a", "b", "c"], {
          id: "c",
          value: 4
        });
        tree.set(["a", "d"], {
          id: "d",
          value: 5
        });
        tree.set(["a", "d", "e"], {
          id: "e",
          value: 6
        });
        tree.set(["a", "d", "e", "f"], {
          id: "f",
          value: 7
        });
        tree.cascade(add10, ["root", "a", "d"], true);
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
          value: 15
        });
        expect(tree.get(["a", "d", "e"])).toEqual({
          id: "e",
          value: 16
        });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({
          id: "f",
          value: 17
        });
      });
      test("simulate reducing behaviour on a node's descendents", function () {
        function totalToRoot(_ref11, tree) {
          var _ref12 = _slicedToArray(_ref11, 2),
              k = _ref12[0],
              datum = _ref12[1];

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
        tree.cascade(totalToRoot, ["root"], true);
        expect(tree.get(["root"])).toEqual({
          id: "root",
          value: 29
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
  });
  describe("for trees which have distinct node Ids", function () {
    describe("where inclusive is false (default)", function () {
      test("iterate through a node's descendents", function () {
        var visited = [];

        var returnUndefined = function returnUndefined(_ref13, tree) {
          var _ref14 = _slicedToArray(_ref13, 2),
              k = _ref14[0],
              datum = _ref14[1];

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
        }, "e"); // distinct trees only use the tip

        tree.cascade(returnUndefined, "d", false);
        expect(visited).toEqual(["e", "f"]);
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
      test("applies a function to a node's descendents", function () {
        var add10 = function add10(_ref15) {
          var _ref16 = _slicedToArray(_ref15, 2),
              k = _ref16[0],
              datum = _ref16[1];

          if (!datum) return datum; // best practice: always guard!

          var id = datum.id,
              value = datum.value;
          var v = value ? value + 10 : value;
          return [k, {
            id: id,
            value: v
          }];
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
        tree.cascade(add10, "d", false);
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
          value: 16
        });
        expect(tree.get("f")).toEqual({
          id: "f",
          value: 17
        });
      });
      test("simulate reducing behaviour on a node's descendents", function () {
        function totalToRoot(_ref17, tree) {
          var _ref18 = _slicedToArray(_ref17, 2),
              k = _ref18[0],
              datum = _ref18[1];

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
        tree.cascade(totalToRoot, ["root"], false);
        expect(tree.get("root")).toEqual({
          id: "root",
          value: 28
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
    describe("where inclusive is true", function () {
      test("iterate through a node's descendents", function () {
        var visited = [];

        var returnUndefined = function returnUndefined(_ref19, tree) {
          var _ref20 = _slicedToArray(_ref19, 2),
              k = _ref20[0],
              datum = _ref20[1];

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
        tree.cascade(returnUndefined, "d", true);
        expect(visited).toEqual(["d", "e", "f"]);
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
      test("applies a function to a node and its descendents", function () {
        var add10 = function add10(_ref21) {
          var _ref22 = _slicedToArray(_ref21, 2),
              k = _ref22[0],
              datum = _ref22[1];

          if (!datum) return datum; // best practice: always guard!

          var id = datum.id,
              value = datum.value;
          var v = value ? value + 10 : value;
          return [k, {
            id: id,
            value: v
          }];
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
        tree.cascade(add10, "d", true);
        expect(tree.get("root")).toEqual({
          id: "root",
          value: 1
        });
        expect(tree.get("a")).toEqual({
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
          value: 15
        });
        expect(tree.get(["a", "d", "e"])).toEqual({
          id: "e",
          value: 16
        });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({
          id: "f",
          value: 17
        });
      });
      test("simulate reducing behaviour on a node's descendents", function () {
        function totalToRoot(_ref23, tree) {
          var _ref24 = _slicedToArray(_ref23, 2),
              k = _ref24[0],
              datum = _ref24[1];

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
        tree.cascade(totalToRoot, ["root"], true);
        expect(tree.get("root")).toEqual({
          id: "root",
          value: 29
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
});