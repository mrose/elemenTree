import { deriveFullPath, Tree } from "../tree";

describe(`deriveFullPath function`, () => {
  test(`coerces delimited strings, simple strings, and arrays to path arrays`, () => {
    const tree = Tree.factory();

    // standard coercion converts strings to path arrays
    // an empty or undefined argument refers to the root
    // usage below is not preferred because it is not explicit
    expect(deriveFullPath(tree)()).toEqual(["root"]);
    expect(deriveFullPath(tree)()).toBeInstanceOf(Array);
    // use delimited strings or path arrays
    expect(deriveFullPath(tree)("root")).toEqual(["root"]);
    // below usage is preferred:
    expect(deriveFullPath(tree)(["root"])).toEqual(["root"]);
    expect(deriveFullPath(tree)("foo")).toEqual(["root", "foo"]);
    expect(deriveFullPath(tree)(["foo"])).toEqual(["root", "foo"]);
    expect(deriveFullPath(tree)("foo|bar")).toEqual(["root", "foo", "bar"]);
    expect(deriveFullPath(tree)(["foo", "bar"])).toEqual([
      "root",
      "foo",
      "bar",
    ]);
    // this won't work:
    expect(() => deriveFullPath(tree)({ foo: "bar" })).toThrow();
    // standard coercions are applied first.
    tree.set(["a", "b", "c"], { id: 42, color: "blue" });
  });
});
