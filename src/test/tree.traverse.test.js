import { Tree } from "../tree";

describe(`The traverse method`, () => {
  // fn, path, order
  test(`throws an error when node does not exist`, () => {
    const tree1 = Tree.factory();
    expect(() => tree1.traverse(undefined, ["a"])).toThrow();
  });

  test(`throws an error when order is not one of "asc" or "desc"`, () => {
    const tree = Tree.factory();
    expect(() => tree.traverse(undefined, ["root"], true)).toThrow();
    expect(() => tree.traverse(undefined, ["root"])).toBeInstanceOf(Object);
    expect(() => tree.traverse(undefined, ["root"], "asc")).toBeInstanceOf(
      Object
    );
    expect(() => tree.traverse(undefined, ["root"], "desc")).toBeInstanceOf(
      Object
    );
  });

  test.skip(`function defaults to _.identity`, () => {});

  describe(`for trees which have non-distinct node Ids`, () => {
    test(`iterate through a node's path`, () => {
      const returnUndefined = ([k, datum], tree) => {
        // console.log('do something');
        return undefined;
      };
      const tree = Tree.factory({ distinct: false });
      tree.set(["root"], { id: "root", value: 1 });
      tree.set(["root", "a"], { id: "a", value: 2 });
      tree.set(["root", "a", "b"], { id: "b", value: 3 });
      tree.set(["root", "a", "b", "c"], { id: "c", value: 4 });
      tree.set(["root", "a", "d"], { id: "d", value: 5 });
      tree.set(["root", "a", "d", "e"], { id: "e", value: 6 });
      tree.set(["root", "a", "d", "e", "f"], { id: "f", value: 7 });

      tree.traverse(returnUndefined, ["root", "a", "d", "e", "f"]);
      expect(tree.get(["root"])).toEqual({ id: "root", value: 1 });
      expect(tree.get(["a"])).toEqual({ id: "a", value: 2 });
      expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
      expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
      expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 5 });
      expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 6 });
      expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 7 });
    });
    test(`apply a function to a node's path`, () => {
      const add10 = ([k, datum], tree) => {
        if (!datum) return datum; // best practice: always guard!
        datum.value += 10;
        return [k, datum];
      };
      const tree = Tree.factory({ distinct: false });
      tree.set(["root"], { id: "root", value: 1 });
      tree.set(["root", "a"], { id: "a", value: 2 });
      tree.set(["root", "a", "b"], { id: "b", value: 3 });
      tree.set(["root", "a", "b", "c"], { id: "c", value: 4 });
      tree.set(["root", "a", "d"], { id: "d", value: 5 });
      tree.set(["root", "a", "d", "e"], { id: "e", value: 6 });
      tree.set(["root", "a", "d", "e", "f"], { id: "f", value: 7 });

      tree.traverse(add10, ["a", "d", "e"]);
      expect(tree.get(["root"])).toEqual({ id: "root", value: 11 });
      expect(tree.get(["a"])).toEqual({ id: "a", value: 12 });
      expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
      expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
      expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 15 });
      expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 16 });
      expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 7 });
    });
    test(`simulate reducing behaviour on a node's path`, () => {
      function totalToRoot([k, datum], tree) {
        let rd = tree.get(["root"]);
        rd.value += datum.value;
        return ["root", rd];
      }

      const tree = Tree.factory({ distinct: false });
      tree.set(["root"], { id: "root", value: 1 });
      tree.set(["root", "a"], { id: "a", value: 2 });
      tree.set(["root", "a", "b"], { id: "b", value: 3 });
      tree.set(["root", "a", "b", "c"], { id: "c", value: 4 });
      tree.set(["root", "a", "d"], { id: "d", value: 5 });
      tree.set(["root", "a", "d", "e"], { id: "e", value: 6 });
      tree.set(["root", "a", "d", "e", "f"], { id: "f", value: 7 });

      tree.traverse(totalToRoot, ["root", "a", "d"]);
      //(1 + 1 + 2 + 5 = 9)
      expect(tree.get(["root"])).toEqual({ id: "root", value: 9 });
      expect(tree.get(["a"])).toEqual({ id: "a", value: 2 });
      expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
      expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
      expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 5 });
      expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 6 });
      expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 7 });
    });
  });

  describe(`for trees which have distinct node Ids`, () => {
    test(`iterate through a node's path`, () => {
      let visited = [];
      const returnUndefined = ([k, datum], tree) => {
        visited.push(k);
        return undefined;
      };
      const tree = Tree.factory({ distinct: true });
      tree.set("root", { id: "root", value: 1 });
      tree.set("a", { id: "a", value: 2 });
      tree.set("b", { id: "b", value: 3 }, "a");
      tree.set("c", { id: "c", value: 4 }, "b");
      tree.set("d", { id: "d", value: 5 }, "a");
      tree.set("e", { id: "e", value: 6 }, "d");
      tree.set("f", { id: "f", value: 7 }, "e");

      tree.traverse(returnUndefined, "d", "desc");
      expect(visited).toEqual(["root", "a", "d"]);

      visited = [];
      tree.traverse(returnUndefined, "d", "asc");
      expect(visited).toEqual(["d", "a", "root"]);

      expect(tree.get("root")).toEqual({ id: "root", value: 1 });
      expect(tree.get("a")).toEqual({ id: "a", value: 2 });
      expect(tree.get("b")).toEqual({ id: "b", value: 3 });
      expect(tree.get("c")).toEqual({ id: "c", value: 4 });
      expect(tree.get("d")).toEqual({ id: "d", value: 5 });
      expect(tree.get("e")).toEqual({ id: "e", value: 6 });
      expect(tree.get("f")).toEqual({ id: "f", value: 7 });
    });
    test(`applies a function to a node's path`, () => {
      const add10 = ([k, datum]) => {
        if (!datum) return datum; // best practice: always guard!
        datum.value += 10;
        return [k, datum];
      };
      const tree = Tree.factory({ distinct: true });
      tree.set("root", { id: "root", value: 1 });
      tree.set("a", { id: "a", value: 2 });
      tree.set("b", { id: "b", value: 3 }, "a");
      tree.set("c", { id: "c", value: 4 }, "b");
      tree.set("d", { id: "d", value: 5 }, "a");
      tree.set("e", { id: "e", value: 6 }, "d");
      tree.set("f", { id: "f", value: 7 }, "e");

      tree.traverse(add10, "d");
      expect(tree.get("root")).toEqual({ id: "root", value: 11 });
      expect(tree.get("a")).toEqual({ id: "a", value: 12 });
      expect(tree.get("b")).toEqual({ id: "b", value: 3 });
      expect(tree.get("c")).toEqual({ id: "c", value: 4 });
      expect(tree.get("d")).toEqual({ id: "d", value: 15 });
      expect(tree.get("e")).toEqual({ id: "e", value: 6 });
      expect(tree.get("f")).toEqual({ id: "f", value: 7 });
    });
    test(`simulate reducing behaviour on a node's path`, () => {
      function totalToRoot([k, datum], tree) {
        let rd = tree.get(["root"]);
        rd.value += datum.value;
        return ["root", rd];
      }

      const tree = Tree.factory({ distinct: true });
      tree.set("root", { id: "root", value: 1 });
      tree.set("a", { id: "a", value: 2 });
      tree.set("b", { id: "b", value: 3 }, "a");
      tree.set("c", { id: "c", value: 4 }, "b");
      tree.set("d", { id: "d", value: 5 }, "a");
      tree.set("e", { id: "e", value: 6 }, "d");
      tree.set("f", { id: "f", value: 7 }, "e");

      tree.traverse(totalToRoot, "e");

      //(1+2+3+4+5 = 15)
      expect(tree.get("root")).toEqual({ id: "root", value: 15 });
      expect(tree.get("a")).toEqual({ id: "a", value: 2 });
      expect(tree.get("b")).toEqual({ id: "b", value: 3 });
      expect(tree.get("c")).toEqual({ id: "c", value: 4 });
      expect(tree.get("d")).toEqual({ id: "d", value: 5 });
      expect(tree.get("e")).toEqual({ id: "e", value: 6 });
      expect(tree.get("f")).toEqual({ id: "f", value: 7 });
    });
  });
});
