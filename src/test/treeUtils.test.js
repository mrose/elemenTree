import { Tree } from "../tree";
import {
  coerce,
  hasRootDatum,
  p2s,
  p2228t,
  s2p,
  setIntermediates,
} from "../treeUtils";

describe(`tree utilities`, () => {
  test.skip(`coerce() coerces delimited strings, simple strings, and arrays to path arrays`, () => {
    const tree = Tree.factory();

    // standard coercion converts strings to path arrays
    // an empty or undefined argument refers to the root
    // usage below is not preferred because it is not explicit
    expect(coerce(tree)).toEqual(["root"]);
    expect(coerce(tree)).toBeInstanceOf(Array);
    // use delimited strings or path arrays
    expect(coerce(tree, "root")).toEqual(["root"]);
    // below usage is preferred:
    expect(coerce(tree, ["root"])).toEqual(["root"]);
    expect(coerce(tree, "foo")).toEqual(["root", "foo"]);
    expect(coerce(tree, ["foo"])).toEqual(["root", "foo"]);
    expect(coerce(tree, "foo|bar")).toEqual(["root", "foo", "bar"]);
    expect(coerce(tree, ["foo", "bar"])).toEqual(["root", "foo", "bar"]);
    // this won't work:
    expect(() => coerce(tree, { foo: "bar" })).toThrow();
    // standard coercions are applied first.
    tree.set(["a", "b", "c"], { id: 42, color: "blue" });
  });

  test.skip(`hasRootDatum() returns true when the root datum is not undefined`, () => {
    const tree = Tree.factory();
    expect(hasRootDatum(tree)).toBeFalsy();
    tree.set("root", "foo");
    expect(hasRootDatum(tree)).toBeTruthy();
  });

  test.skip(`p2s() converts a path to a delimited string`, () => {
    const tree = Tree.factory();
    expect(p2s(tree, ["a", "b", "c"])).toEqual("a|b|c");
    expect(p2s(tree, undefined)).toEqual("");
  });

  test.skip(`p2228t() `, () => {
    const tree0 = Tree.factory({ distinct: true });
    const tree1 = Tree.factory({ distinct: false });
    expect(p2228t(tree0, "a|b|c")).toEqual();
    expect(p2228t(tree1, "a|b|c")).toEqual();
  });

  test.skip(`s2p() converts a delimited string to a path`, () => {
    const tree = Tree.factory({ path_string_delimiter: ":" });
    expect(s2p(tree, "a:b:c")).toEqual(["a", "b", "c"]);
  });

  test.skip(`setIntermediates()  `, () => {});
});
