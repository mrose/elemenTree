import { Tree } from "../tree";

describe(`The everyOf method`, () => {
  // everyOf(fn, path, inclusive, depth,)
  test(`throws an error when function argument is not a function`, () => {
    const notAFunction = `blue`;
    const tree = Tree.factory();
    tree.set(["a"], { aintGotNoId: true });
    expect(() => tree.everyOf(notAFunction, ["a"], false, 0)).toThrow();
  });

  test(`throws an error when depth is not an integer`, () => {
    const hasAnId = ([k, v]) => (v ? v.id && v.id.length : false);
    const tree = Tree.factory();
    expect(() => tree.everyOf(hasAnId, ["a"], true, "depth")).toThrow();
  });

  test(`throws an error when node for path does not exist`, () => {
    const hasAnId = ([k, v]) => (v ? v.id && v.id.length : false);
    const tree = Tree.factory();
    expect(() => tree.everyOf(hasAnId, ["a"], true, 0)).toThrow();
  });

  test(`throws an error when depth is zero and inclusive is false`, () => {
    const hasAnId = ([k, v]) => (v ? v.id && v.id.length : false);
    const tree = Tree.factory();
    tree.set(["a"], { aintGotNoId: true });
    expect(() => tree.everyOf(hasAnId, ["a"], false, 0)).toThrow();
  });

  describe(`for trees which have non-distinct node Ids`, () => {
    describe(`where inclusive is true`, () => {
      test(`tests whether all qualifying entries pass the test implemented by the provided function`, () => {
        const hasAnId = ([k, v]) => (v ? v.id && v.id.length : false);
        const tree = Tree.factory({ distinct: false });
        tree.set(["c"], { id: "c" });
        tree.set(["c", "d"], { aintGotNoId: true });
        tree.set(["c", "d", "g"], { id: "g" });
        tree.set(["b"], { id: "b" });
        tree.set(["a"], { id: "a" });
        tree.set(["a", "d"], { id: "d" });
        tree.set(["a", "e"], { id: "e" });
        tree.set(["a", "e", "f"], { id: "f" });

        //expect(tree.everyOf('', true)).toBe(false);
        expect(tree.everyOf(hasAnId, ["root"], true)).toBe(false);

        // all depths
        expect(tree.everyOf(hasAnId, ["c"], true)).toBe(false);

        expect(tree.everyOf(hasAnId, ["a"], true)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e"], true)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e", "f"], true)).toBe(true);

        // depth
        expect(tree.everyOf(hasAnId, ["c"], true, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, ["c"], true, 2)).toBe(false);
        expect(tree.everyOf(hasAnId, ["a", "e"], true, 1)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e"], true, 2)).toBe(true);
        expect(tree.everyOf(hasAnId, ["root"], true, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, ["root"], true, 2)).toBe(false);
      });
    });

    describe(`where inclusive is false (default)`, () => {
      test(`tests whether all qualifying entries pass the test implemented by the provided function`, () => {
        const hasAnId = ([k, v]) => (v ? v.id && v.id.length : false);
        const tree = Tree.factory({ distinct: false });

        // n.b. empty sets return TRUE
        expect(tree.everyOf(hasAnId, ["root"], false)).toBe(true);

        tree.set(["c"], { id: "c" });
        tree.set(["c", "d"], { aintGotNoId: true });
        tree.set(["b"], { id: "b" });
        tree.set(["a"], { id: "a" });
        tree.set(["a", "d"], { id: "d" });
        tree.set(["a", "e"], { id: "e" });
        tree.set(["a", "e", "f"], { id: "f" });

        expect(tree.everyOf(hasAnId, "", false)).toBe(false);
        expect(tree.everyOf(hasAnId, ["root"], false)).toBe(false);

        // all depths
        expect(tree.everyOf(hasAnId, ["c"], false)).toBe(false);

        expect(tree.everyOf(hasAnId, ["a"], false)).toBe(true);
        expect(tree.everyOf(hasAnId, ["a", "e"], false)).toBe(true);
        // another empty set returns TRUE
        expect(tree.everyOf(hasAnId, ["a", "e", "f"], false)).toBe(true);

        // depth
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

  describe(`for trees which have distinct node Ids`, () => {
    describe(`where inclusive is true`, () => {
      test(`tests whether all qualifying entries pass the test implemented by the provided function`, () => {
        const hasAnId = ([k, v]) => (v ? v.id && v.id.length : false);
        const tree = Tree.factory({ distinct: true });

        expect(tree.everyOf(hasAnId, "root", true)).toBe(false);

        tree.set("c", { id: "c" });
        // you can use full path format if you prefer
        tree.set(["c", "g"], { aintGotNoId: true });
        tree.set("b", { id: "b" });
        tree.set("a", { id: "a" });
        tree.set("d", { id: "d" }, "a");
        tree.set("e", { id: "e" });
        tree.set("f", { id: "f" }, "e");

        expect(tree.everyOf(undefined, "", true)).toBe(true);
        expect(tree.everyOf(hasAnId, "root", true)).toBe(false);

        // all depths
        expect(tree.everyOf(hasAnId, "c", true)).toBe(false);

        expect(tree.everyOf(hasAnId, "a", true)).toBe(true);
        expect(tree.everyOf(hasAnId, "e", true)).toBe(true);
        expect(tree.everyOf(hasAnId, "f", true)).toBe(true);

        // depth
        expect(tree.everyOf(hasAnId, "c", true, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, "c", true, 2)).toBe(false);
        expect(tree.everyOf(hasAnId, "e", true, 1)).toBe(true);
        expect(tree.everyOf(hasAnId, "e", true, 2)).toBe(true);
        expect(tree.everyOf(hasAnId, "root", true, 1)).toBe(false);
        expect(tree.everyOf(hasAnId, "root", true, 2)).toBe(false);
      });
    });

    describe(`where inclusive is false (default)`, () => {
      test(`tests whether all qualifying entries pass the test implemented by the provided function`, () => {
        const hasAnId = ([k, v]) => (v ? v.id && v.id.length : false);
        const tree = Tree.factory({ distinct: true });
        // n.b. empty sets return TRUE
        expect(tree.everyOf(hasAnId, ["root"], false)).toBe(true);

        tree.set("c", { id: "c" });
        tree.set("g", { aintGotNoId: true }, "c");
        tree.set("b", { id: "b" });
        tree.set("a", { id: "a" });
        tree.set("d", { id: "d" }, "a");
        tree.set("e", { id: "e" }, "a");
        tree.set("f", { id: "f" }, "e");

        expect(tree.everyOf(hasAnId, "", false)).toBe(false);
        expect(tree.everyOf(hasAnId, "root", false)).toBe(false);

        // all depths
        expect(tree.everyOf(hasAnId, "c", false)).toBe(false);

        expect(tree.everyOf(hasAnId, "a", false)).toBe(true);
        expect(tree.everyOf(hasAnId, "e", false)).toBe(true);
        // another empty set returns TRUE
        expect(tree.everyOf(hasAnId, "f", false)).toBe(true);

        // depth
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
