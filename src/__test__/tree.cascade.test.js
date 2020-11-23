import { Tree } from "../tree";

describe(`The cascade method`, () => {
  // fn, path, inclusive
  test(`throws an error when node does not exist`, () => {
    const tree1 = Tree.factory();
    expect(() => tree1.cascade(undefined, ["a"], true)).toThrow();
  });

  test(`function defaults to _.identity`);

  describe(`for trees which have non-distinct node Ids`, () => {
    describe(`where inclusive is false (default)`, () => {
      test(`iterate through a node's descendents`, () => {
        let visited = [];
        const returnUndefined = ([k, datum], tree) => {
          visited.push(k);
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

        // show_root = auto and should be true since root datum is defined.
        tree.cascade(returnUndefined, ["root", "a", "d"], false);
        expect(visited).toEqual([
          ["root", "a", "d", "e"],
          ["root", "a", "d", "e", "f"]
        ]);
        visited = [];
        tree.cascade(returnUndefined, ["a", "d"], false);
        expect(visited).toEqual([
          ["root", "a", "d", "e"],
          ["root", "a", "d", "e", "f"]
        ]);

        // show root = auto so is false
        tree.set(["root"], undefined);
        visited = [];
        tree.cascade(returnUndefined, ["a", "d"], false);
        expect(visited).toEqual([
          ["a", "d", "e"],
          ["a", "d", "e", "f"]
        ]);
        visited = [];
        // if you're not using root you probably wouldnt' do the below
        tree.cascade(returnUndefined, ["root", "a", "d"], false);
        expect(visited).toEqual([
          ["a", "d", "e"],
          ["a", "d", "e", "f"]
        ]);
        tree.set(["root"], { id: "root", value: 1 });

        expect(tree.get(["root"])).toEqual({ id: "root", value: 1 });
        expect(tree.get(["a"])).toEqual({ id: "a", value: 2 });
        expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
        expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
        expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 5 });
        expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 6 });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 7 });
      });
      test(`apply a function to a node's descendents`, () => {
        const add10 = ([k, datum], tree) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return [k, { id, value: v }];
        };
        const tree = Tree.factory({ distinct: false });
        tree.set(["root"], { id: "root", value: 1 });
        tree.set(["root", "a"], { id: "a", value: 2 });
        tree.set(["root", "a", "b"], { id: "b", value: 3 });
        tree.set(["root", "a", "b", "c"], { id: "c", value: 4 });
        tree.set(["root", "a", "d"], { id: "d", value: 5 });
        tree.set(["root", "a", "d", "e"], { id: "e", value: 6 });
        tree.set(["root", "a", "d", "e", "f"], { id: "f", value: 7 });

        tree.cascade(add10, ["root", "a", "d"], false);
        expect(tree.get(["root"])).toEqual({ id: "root", value: 1 });
        expect(tree.get(["a"])).toEqual({ id: "a", value: 2 });
        expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
        expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
        expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 5 });
        expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 16 });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 17 });
      });
      test(`simulate reducing behaviour on a node's descendents`, () => {
        function totalToRoot([k, datum], tree) {
          let rd = tree.get(["root"]);
          rd.value = rd.value + datum.value;
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

        tree.cascade(totalToRoot, ["root"], false);

        expect(tree.get(["root"])).toEqual({ id: "root", value: 28 });
        expect(tree.get(["a"])).toEqual({ id: "a", value: 2 });
        expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
        expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
        expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 5 });
        expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 6 });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 7 });
      });
    });
    describe(`where inclusive is true`, () => {
      test(`iterate through a node's descendents`, () => {
        let visited = [];
        const returnUndefined = ([k, datum], tree) => {
          visited.push(k);
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

        tree.cascade(returnUndefined, ["root", "a", "d"], true);

        expect(visited).toEqual([
          ["root", "a", "d"],
          ["root", "a", "d", "e"],
          ["root", "a", "d", "e", "f"]
        ]);

        expect(tree.get(["root"])).toEqual({ id: "root", value: 1 });
        expect(tree.get(["a"])).toEqual({ id: "a", value: 2 });
        expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
        expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
        expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 5 });
        expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 6 });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 7 });
      });
      test(`applies a function to a node and its descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return [k, { id, value: v }];
        };
        const tree = Tree.factory({ distinct: false });
        tree.set(["root"], { id: "root", value: 1 });
        tree.set(["a"], { id: "a", value: 2 });
        tree.set(["a", "b"], { id: "b", value: 3 });
        tree.set(["a", "b", "c"], { id: "c", value: 4 });
        tree.set(["a", "d"], { id: "d", value: 5 });
        tree.set(["a", "d", "e"], { id: "e", value: 6 });
        tree.set(["a", "d", "e", "f"], { id: "f", value: 7 });

        tree.cascade(add10, ["root", "a", "d"], true);
        expect(tree.get(["root"])).toEqual({ id: "root", value: 1 });
        expect(tree.get(["a"])).toEqual({ id: "a", value: 2 });
        expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
        expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
        expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 15 });
        expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 16 });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 17 });
      });
      test(`simulate reducing behaviour on a node's descendents`, () => {
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

        tree.cascade(totalToRoot, ["root"], true);

        expect(tree.get(["root"])).toEqual({ id: "root", value: 29 });
        expect(tree.get(["a"])).toEqual({ id: "a", value: 2 });
        expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
        expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
        expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 5 });
        expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 6 });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 7 });
      });
    });
  });

  describe(`for trees which have distinct node Ids`, () => {
    describe(`where inclusive is false (default)`, () => {
      test(`iterate through a node's descendents`, () => {
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

        // distinct trees only use the tip
        tree.cascade(returnUndefined, "d", false);
        expect(visited).toEqual([ 'e', 'f']);

        expect(tree.get("root")).toEqual({ id: "root", value: 1 });
        expect(tree.get("a")).toEqual({ id: "a", value: 2 });
        expect(tree.get("b")).toEqual({ id: "b", value: 3 });
        expect(tree.get("c")).toEqual({ id: "c", value: 4 });
        expect(tree.get("d")).toEqual({ id: "d", value: 5 });
        expect(tree.get("e")).toEqual({ id: "e", value: 6 });
        expect(tree.get("f")).toEqual({ id: "f", value: 7 });
      });

      test(`applies a function to a node's descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return [k, { id, value: v }];
        };
        const tree = Tree.factory({ distinct: true });
        tree.set("root", { id: "root", value: 1 });
        tree.set("a", { id: "a", value: 2 });
        tree.set("b", { id: "b", value: 3 }, "a");
        tree.set("c", { id: "c", value: 4 }, "b");
        tree.set("d", { id: "d", value: 5 }, "a");
        tree.set("e", { id: "e", value: 6 }, "d");
        tree.set("f", { id: "f", value: 7 }, "e");

        tree.cascade(add10, "d", false);
        expect(tree.get("root")).toEqual({ id: "root", value: 1 });
        expect(tree.get("a")).toEqual({ id: "a", value: 2 });
        expect(tree.get("b")).toEqual({ id: "b", value: 3 });
        expect(tree.get("c")).toEqual({ id: "c", value: 4 });
        expect(tree.get("d")).toEqual({ id: "d", value: 5 });
        expect(tree.get("e")).toEqual({ id: "e", value: 16 });
        expect(tree.get("f")).toEqual({ id: "f", value: 17 });
      });

      test(`simulate reducing behaviour on a node's descendents`, () => {
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

        tree.cascade(totalToRoot, ["root"], false);

        expect(tree.get("root")).toEqual({ id: "root", value: 28 });
        expect(tree.get("a")).toEqual({ id: "a", value: 2 });
        expect(tree.get("b")).toEqual({ id: "b", value: 3 });
        expect(tree.get("c")).toEqual({ id: "c", value: 4 });
        expect(tree.get("d")).toEqual({ id: "d", value: 5 });
        expect(tree.get("e")).toEqual({ id: "e", value: 6 });
        expect(tree.get("f")).toEqual({ id: "f", value: 7 });
      });
    });
    describe(`where inclusive is true`, () => {
      test(`iterate through a node's descendents`, () => {
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

        tree.cascade(returnUndefined, "d", true);

        expect(visited).toEqual(['d','e','f']);

        expect(tree.get("root")).toEqual({ id: "root", value: 1 });
        expect(tree.get("a")).toEqual({ id: "a", value: 2 });
        expect(tree.get("b")).toEqual({ id: "b", value: 3 });
        expect(tree.get("c")).toEqual({ id: "c", value: 4 });
        expect(tree.get("d")).toEqual({ id: "d", value: 5 });
        expect(tree.get("e")).toEqual({ id: "e", value: 6 });
        expect(tree.get("f")).toEqual({ id: "f", value: 7 });
      });
      test(`applies a function to a node and its descendents`, () => {
        const add10 = ([k, datum]) => {
          if (!datum) return datum; // best practice: always guard!
          const { id, value } = datum;
          const v = value ? value + 10 : value;
          return [k, { id, value: v }];
        };
        const tree = Tree.factory({ distinct: true });
        tree.set("root", { id: "root", value: 1 });
        tree.set("a", { id: "a", value: 2 });
        tree.set("b", { id: "b", value: 3 }, "a");
        tree.set("c", { id: "c", value: 4 }, "b");
        tree.set("d", { id: "d", value: 5 }, "a");
        tree.set("e", { id: "e", value: 6 }, "d");
        tree.set("f", { id: "f", value: 7 }, "e");

        tree.cascade(add10, "d", true);
        expect(tree.get("root")).toEqual({ id: "root", value: 1 });
        expect(tree.get("a")).toEqual({ id: "a", value: 2 });
        expect(tree.get(["a", "b"])).toEqual({ id: "b", value: 3 });
        expect(tree.get(["a", "b", "c"])).toEqual({ id: "c", value: 4 });
        expect(tree.get(["a", "d"])).toEqual({ id: "d", value: 15 });
        expect(tree.get(["a", "d", "e"])).toEqual({ id: "e", value: 16 });
        expect(tree.get(["a", "d", "e", "f"])).toEqual({ id: "f", value: 17 });
      });
      test(`simulate reducing behaviour on a node's descendents`, () => {
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

        tree.cascade(totalToRoot, ["root"], true);

        expect(tree.get("root")).toEqual({ id: "root", value: 29 });
        expect(tree.get("a")).toEqual({ id: "a", value: 2 });
        expect(tree.get("b")).toEqual({ id: "b", value: 3 });
        expect(tree.get("c")).toEqual({ id: "c", value: 4 });
        expect(tree.get("d")).toEqual({ id: "d", value: 5 });
        expect(tree.get("e")).toEqual({ id: "e", value: 6 });
        expect(tree.get("f")).toEqual({ id: "f", value: 7 });
      });
    });
  });
});
