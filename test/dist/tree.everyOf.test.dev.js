"use strict";

var _tree = require("../src/tree");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

describe("The everyOf method", function () {
  // everyOf(fn, path, inclusive, depth,)
  test("throws an error when depth is not an integer", function () {
    var hasAnId = function hasAnId(_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];

      return v ? v.id && v.id.length : false;
    };

    var tree = _tree.Tree.factory();

    expect(function () {
      return tree.everyOf(hasAnId, ["a"], true, "depth");
    }).toThrow();
  });
  test("throws an error when node for path does not exist", function () {
    var hasAnId = function hasAnId(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          k = _ref4[0],
          v = _ref4[1];

      return v ? v.id && v.id.length : false;
    };

    var tree = _tree.Tree.factory();

    expect(function () {
      return tree.everyOf(hasAnId, ["a"], true, 0);
    }).toThrow();
  });
  test("throws an error when depth is zero and inclusive is false", function () {
    var hasAnId = function hasAnId(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          k = _ref6[0],
          v = _ref6[1];

      return v ? v.id && v.id.length : false;
    };

    var tree = _tree.Tree.factory();

    tree.set(["a"], {
      aintGotNoId: true
    });
    expect(function () {
      return tree.everyOf(hasAnId, ["a"], false, 0);
    }).toThrow();
  }); // TODO: throws on invalid fn (new truthy fn default), inclusive

  describe("for trees which have non-distinct node Ids", function () {
    describe("where inclusive is true", function () {
      test("tests whether all qualifying entries pass the test implemented by the provided function", function () {
        var hasAnId = function hasAnId(_ref7) {
          var _ref8 = _slicedToArray(_ref7, 2),
              k = _ref8[0],
              v = _ref8[1];

          return v ? v.id && v.id.length : false;
        };

        var tree = _tree.Tree.factory({
          distinct: false
        });

        tree.set(["c"], {
          id: "c"
        });
        tree.set(["c", "d"], {
          aintGotNoId: true
        });
        tree.set(["c", "d", "g"], {
          id: "g"
        });
        tree.set(["b"], {
          id: "b"
        });
        tree.set(["a"], {
          id: "a"
        });
        tree.set(["a", "d"], {
          id: "d"
        });
        tree.set(["a", "e"], {
          id: "e"
        });
        tree.set(["a", "e", "f"], {
          id: "f"
        }); //expect(tree.everyOf('', true)).toBe(false);

        expect(tree.everyOf(hasAnId, ["root"], true)).toBe(false); // all depths

        expect(tree.everyOf(hasAnId, ["c"], true)).toBe(false);
        expect(tree.everyOf(hasAnId, ["a"], true)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e"], true)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e", "f"], true)).toBe(true); // depth

        expect(tree.everyOf(hasAnId, ["c"], true, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, ["c"], true, 2)).toBe(false);
        expect(tree.everyOf(hasAnId, ["a", "e"], true, 1)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e"], true, 2)).toBe(true);
        expect(tree.everyOf(hasAnId, ["root"], true, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, ["root"], true, 2)).toBe(false);
      });
    });
    describe("where inclusive is false (default)", function () {
      test("tests whether all qualifying entries pass the test implemented by the provided function", function () {
        var hasAnId = function hasAnId(_ref9) {
          var _ref10 = _slicedToArray(_ref9, 2),
              k = _ref10[0],
              v = _ref10[1];

          return v ? v.id && v.id.length : false;
        };

        var tree = _tree.Tree.factory({
          distinct: false
        }); // n.b. empty sets return TRUE


        expect(tree.everyOf(hasAnId, ["root"], false)).toBe(true);
        tree.set(["c"], {
          id: "c"
        });
        tree.set(["c", "d"], {
          aintGotNoId: true
        });
        tree.set(["b"], {
          id: "b"
        });
        tree.set(["a"], {
          id: "a"
        });
        tree.set(["a", "d"], {
          id: "d"
        });
        tree.set(["a", "e"], {
          id: "e"
        });
        tree.set(["a", "e", "f"], {
          id: "f"
        });
        expect(tree.everyOf(hasAnId, "", false)).toBe(false);
        expect(tree.everyOf(hasAnId, ["root"], false)).toBe(false); // all depths

        expect(tree.everyOf(hasAnId, ["c"], false)).toBe(false);
        expect(tree.everyOf(hasAnId, ["a"], false)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e"], false)).toBe(true); // another empty set returns TRUE

        expect(tree.everyOf(hasAnId, ["a", "e", "f"], false)).toBe(true); // depth

        expect(tree.everyOf(hasAnId, ["c"], false, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, ["c"], false, 2)).toBe(false);
        expect(tree.everyOf(hasAnId, ["c"], false, 99999)).toBe(false);
        expect(tree.everyOf(hasAnId, ["a", "e"], false, 1)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e"], false, 2)).toBe(true);
        expect(tree.everyOf(hasAnId, ["root"], false, 1)).toBe(true);
        expect(tree.everyOf(hasAnId, ["root"], false, 2)).toBe(false);
      });
    });
  });
  describe("for trees which have distinct node Ids", function () {
    describe("where inclusive is true", function () {
      test("tests whether all qualifying entries pass the test implemented by the provided function", function () {
        var hasAnId = function hasAnId(_ref11) {
          var _ref12 = _slicedToArray(_ref11, 2),
              k = _ref12[0],
              v = _ref12[1];

          return v ? v.id && v.id.length : false;
        };

        var tree = _tree.Tree.factory({
          distinct: true
        });

        expect(tree.everyOf(hasAnId, "root", true)).toBe(false);
        tree.set("c", {
          id: "c"
        }); // you can use full path format if you prefer

        tree.set(["c", "g"], {
          aintGotNoId: true
        });
        tree.set("b", {
          id: "b"
        });
        tree.set("a", {
          id: "a"
        });
        tree.set("d", {
          id: "d"
        }, "a");
        tree.set("e", {
          id: "e"
        });
        tree.set("f", {
          id: "f"
        }, "e");
        expect(tree.everyOf(undefined, "", true)).toBe(true);
        expect(tree.everyOf(hasAnId, "root", true)).toBe(false); // all depths

        expect(tree.everyOf(hasAnId, "c", true)).toBe(false);
        expect(tree.everyOf(hasAnId, "a", true)).toBe(true);
        expect(tree.everyOf(hasAnId, "e", true)).toBe(true);
        expect(tree.everyOf(hasAnId, "f", true)).toBe(true); // depth

        expect(tree.everyOf(hasAnId, "c", true, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, "c", true, 2)).toBe(false);
        expect(tree.everyOf(hasAnId, "e", true, 1)).toBe(true);
        expect(tree.everyOf(hasAnId, "e", true, 2)).toBe(true);
        expect(tree.everyOf(hasAnId, "root", true, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, "root", true, 2)).toBe(false);
      });
    });
    describe("where inclusive is false (default)", function () {
      test("tests whether all qualifying entries pass the test implemented by the provided function", function () {
        var hasAnId = function hasAnId(_ref13) {
          var _ref14 = _slicedToArray(_ref13, 2),
              k = _ref14[0],
              v = _ref14[1];

          return v ? v.id && v.id.length : false;
        };

        var tree = _tree.Tree.factory({
          distinct: true
        }); // n.b. empty sets return TRUE


        expect(tree.everyOf(hasAnId, ["root"], false)).toBe(true);
        tree.set("c", {
          id: "c"
        });
        tree.set("g", {
          aintGotNoId: true
        }, "c");
        tree.set("b", {
          id: "b"
        });
        tree.set("a", {
          id: "a"
        });
        tree.set("d", {
          id: "d"
        }, "a");
        tree.set("e", {
          id: "e"
        }, "a");
        tree.set("f", {
          id: "f"
        }, "e");
        expect(tree.everyOf(hasAnId, "", false)).toBe(false);
        expect(tree.everyOf(hasAnId, "root", false)).toBe(false); // all depths

        expect(tree.everyOf(hasAnId, "c", false)).toBe(false);
        expect(tree.everyOf(hasAnId, "a", false)).toBe(true);
        expect(tree.everyOf(hasAnId, "e", false)).toBe(true); // another empty set returns TRUE

        expect(tree.everyOf(hasAnId, "f", false)).toBe(true); // depth

        expect(tree.everyOf(hasAnId, "c", false, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, "c", false, 2)).toBe(false);
        expect(tree.everyOf(hasAnId, "c", false, 99999)).toBe(false);
        expect(tree.everyOf(hasAnId, "e", false, 1)).toBe(true);
        expect(tree.everyOf(hasAnId, "e", false, 2)).toBe(true);
        expect(tree.everyOf(hasAnId, "root", false, 1)).toBe(true);
        expect(tree.everyOf(hasAnId, "root", false, 2)).toBe(false);
      });
    });
  });
});