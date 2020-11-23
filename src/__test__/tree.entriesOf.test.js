import { Tree } from "../tree";

describe(`The entriesOf method`, () => {
  // path, inclusive, nested, depth
  test(`throws an error when depth is not an integer`, () => {
    const tree = Tree.factory({ distinct: false });
    tree.set(["a"], { id: "a" });
    expect(() => tree.entriesOf(["a"], true, false, "depth")).toThrow();
  });

  test(`throws an error when depth is zero and inclusive is false`, () => {
    const tree = Tree.factory({ distinct: false });
    tree.set(["a"], { id: "a" });
    expect(() => tree.entriesOf(["a"], false, false, 0)).toThrow();
    expect(tree.entriesOf(["a"], true, false, 0)).toBeInstanceOf(Array);
  });

  // TODO: throws when path is invalid, inclusive is invalid, nested is invalid

  describe(`for trees which have non-distinct node Ids`, () => {
    test(`returns an empty entries array when the path does not refer to an existing node`, () => {
      const tree = Tree.factory({ distinct: false });
      tree.set(["a"], { id: "a" });
      expect(tree.entriesOf(["b"])).toEqual([]);
    });

    test(`returns an empty entries array when no descendents exist and inclusive is false`, () => {
      const tree = Tree.factory({ distinct: false });
      expect(tree.entriesOf()).toEqual([]);
      expect(tree.entriesOf("root")).toEqual([]);
      expect(tree.entriesOf(["root"])).toEqual([]);

      tree.set(["a"], { id: "a" });
      expect(tree.entriesOf("a")).toEqual([]);
      expect(tree.entriesOf("a")).toEqual([]);
      expect(tree.entriesOf(["a"])).toEqual([]);

      tree.set(["a", "b"], { id: "b" });
      expect(tree.entriesOf(["a", "b"])).toEqual([]);
      expect(tree.entriesOf("a|b")).toEqual([]);
    });

    test(`returns a single entry when no descendents exist and inclusive is true`, () => {
      const tree = Tree.factory({ datum: { id: "root" }, distinct: false });

      // dumb, but someone will do it
      tree.show_root = "no";
      expect(tree.entriesOf(undefined, true)).toEqual([[[], { id: "root" }]]);

      tree.show_root = "auto";
      expect(tree.entriesOf(undefined, true)).toEqual([
        [["root"], { id: "root" }]
      ]);
      expect(tree.entriesOf("root", true)).toEqual([
        [["root"], { id: "root" }]
      ]);
      expect(tree.entriesOf(["root"], true)).toEqual([
        [["root"], { id: "root" }]
      ]);

      tree.set(["a"], { id: "a" });
      expect(tree.entriesOf("a", true)).toEqual([[["root", "a"], { id: "a" }]]);
      expect(tree.entriesOf("a", true)).toEqual([[["root", "a"], { id: "a" }]]);
      expect(tree.entriesOf(["a"], true)).toEqual([
        [["root", "a"], { id: "a" }]
      ]);

      tree.set(["a", "b"], { id: "b" });
      expect(tree.entriesOf(["a", "b"], true)).toEqual([
        [["root", "a", "b"], { id: "b" }]
      ]);
      expect(tree.entriesOf("a|b", true)).toEqual([
        [["root", "a", "b"], { id: "b" }]
      ]);
    });

    test(`returns a flat entries array of descendents when nested is false`, () => {
      const tree = Tree.factory({ distinct: false, show_root: "auto" });
      tree.set("c", { id: "c" });
      tree.set("b", { id: "b" });
      tree.set("a", { id: "a" });
      tree.set(["a", "d"], { id: "d" });
      tree.set(["a", "e"], { id: "e" });
      tree.set(["a", "e", "f"], { id: "f" });
      tree.set(["a", "e", "g"], { id: "g" });

      // show_root is auto and root has no datum so root is not included
      expect(tree.entriesOf(["a"], true, false, 1)).toEqual([
        [["a"], { id: "a" }],
        [["a", "d"], { id: "d" }],
        [["a", "e"], { id: "e" }]
      ]);

      expect(tree.entriesOf(["a"], false, false)).toEqual([
        [["a", "d"], { id: "d" }],
        [["a", "e"], { id: "e" }],
        [["a", "e", "f"], { id: "f" }],
        [["a", "e", "g"], { id: "g" }]
      ]);

      expect(tree.entriesOf(["a", "e"], false, false)).toEqual([
        [["a", "e", "f"], { id: "f" }],
        [["a", "e", "g"], { id: "g" }]
      ]);

      // set show_root to 'yes' so root is included
      tree.show_root = "yes";
      expect(tree.entriesOf(["a"], true, false, 1)).toEqual([
        [["root", "a"], { id: "a" }],
        [["root", "a", "d"], { id: "d" }],
        [["root", "a", "e"], { id: "e" }]
      ]);

      expect(tree.entriesOf(["a"], false, false)).toEqual([
        [["root", "a", "d"], { id: "d" }],
        [["root", "a", "e"], { id: "e" }],
        [["root", "a", "e", "f"], { id: "f" }],
        [["root", "a", "e", "g"], { id: "g" }]
      ]);

      expect(tree.entriesOf(["a", "e"], false, false)).toEqual([
        [["root", "a", "e", "f"], { id: "f" }],
        [["root", "a", "e", "g"], { id: "g" }]
      ]);
    });

    test(`returns a nested [key, datum, entries] array of descendents when nested is true`, () => {
      const tree = Tree.factory({
        datum: { id: "root" },
        distinct: false,
        show_root: "no"
      });
      tree.set("c", { id: "c" });
      tree.set("b", { id: "b" });
      tree.set("a", { id: "a" });
      tree.set(["a", "d"], { id: "d" });
      tree.set(["a", "d", "h"], { id: "h" });
      tree.set(["a", "e"], { id: "e" });
      tree.set(["a", "e", "f"], { id: "f" });
      tree.set(["a", "e", "g"], { id: "g" });

      expect(tree.entriesOf(["a"], true, true, 1)).toEqual([
        [
          ["a"],
          { id: "a" },
          [
            [["a", "d"], { id: "d" }, []],
            [["a", "e"], { id: "e" }, []]
          ]
        ]
      ]);

      expect(tree.entriesOf(["a"], false, true)).toEqual([
        [["a", "d"], { id: "d" }, [[["a", "d", "h"], { id: "h" }, []]]],
        [
          ["a", "e"],
          { id: "e" },
          [
            [["a", "e", "f"], { id: "f" }, []],
            [["a", "e", "g"], { id: "g" }, []]
          ]
        ]
      ]);

      expect(tree.entriesOf(["a", "e"], false, true)).toEqual([
        [["a", "e", "f"], { id: "f" }, []],
        [["a", "e", "g"], { id: "g" }, []]
      ]);

      expect(tree.entriesOf("root", false, true)).toEqual([
        [["c"], { id: "c" }, []],
        [["b"], { id: "b" }, []],
        [
          ["a"],
          { id: "a" },
          [
            [["a", "d"], { id: "d" }, [[["a", "d", "h"], { id: "h" }, []]]],
            [
              ["a", "e"],
              { id: "e" },
              [
                [["a", "e", "f"], { id: "f" }, []],
                [["a", "e", "g"], { id: "g" }, []]
              ]
            ]
          ]
        ]
      ]);

      tree.show_root = "auto";
      expect(tree.entriesOf("root", true, true)).toEqual([
        [
          ["root"],
          { id: "root" },
          [
            [["root", "c"], { id: "c" }, []],
            [["root", "b"], { id: "b" }, []],
            [
              ["root", "a"],
              { id: "a" },
              [
                [
                  ["root", "a", "d"],
                  { id: "d" },
                  [[["root", "a", "d", "h"], { id: "h" }, []]]
                ],
                [
                  ["root", "a", "e"],
                  { id: "e" },
                  [
                    [["root", "a", "e", "f"], { id: "f" }, []],
                    [["root", "a", "e", "g"], { id: "g" }, []]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]);
    });
  });

  describe(`for trees which have distinct node Ids`, () => {
    test(`returns an empty entries array when the path does not refer to an existing node`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set(["a"], { id: "a" });
      expect(tree.entriesOf(["b"])).toEqual([]);
    });

    test(`returns an empty entries array when no descendents exist and inclusive is false`, () => {
      const tree = Tree.factory({ distinct: true });
      expect(tree.entriesOf()).toEqual([]);
      expect(tree.entriesOf("root")).toEqual([]);
      expect(tree.entriesOf(["root"])).toEqual([]);

      tree.set(["a"], { id: "a" });
      expect(tree.entriesOf("a")).toEqual([]);
      expect(tree.entriesOf("a")).toEqual([]);
      expect(tree.entriesOf(["a"])).toEqual([]);

      // we can use set with an ancestor because it's a distinct tree
      tree.set("b", { id: "b" }, "a");
      expect(tree.entriesOf(["a", "b"])).toEqual([]);
      expect(tree.entriesOf("a|b")).toEqual([]);
    });

    test(`returns a flat entries array of descendents when nested is false`, () => {
      const tree = Tree.factory({ distinct: true });
      tree.set("c", { id: "c" });
      tree.set("b", { id: "b" });
      tree.set("a", { id: "a" });
      tree.set("d", { id: "d" }, "a");
      tree.set("e", { id: "e" }, "a");
      tree.set("f", { id: "f" }, "e");
      tree.set("g", { id: "g" }, "e");

      // note here you don't get the full node id paths
      expect(tree.entriesOf(["a"], true, false, 1)).toEqual([
        ["a", { id: "a" }],
        ["d", { id: "d" }],
        ["e", { id: "e" }]
      ]);

      expect(tree.entriesOf(["a"], false, false)).toEqual([
        ["d", { id: "d" }],
        ["e", { id: "e" }],
        ["f", { id: "f" }],
        ["g", { id: "g" }]
      ]);

      // full path
      expect(tree.entriesOf(["a", "e"], false, false)).toEqual([
        ["f", { id: "f" }],
        ["g", { id: "g" }]
      ]);

      // or not full path
      expect(tree.entriesOf("e", false, false)).toEqual([
        ["f", { id: "f" }],
        ["g", { id: "g" }]
      ]);
    });

    test(`returns a nested [key, datum, entries] array of descendents when nested is true`, () => {
      const tree = Tree.factory({ datum: { id: "root" }, distinct: true });
      tree.set("c", { id: "c" });
      tree.set("b", { id: "b" });
      tree.set("a", { id: "a" });
      tree.set("d", { id: "d" }, "a");
      tree.set("h", { id: "h" }, "d");
      tree.set("e", { id: "e" }, "a");
      tree.set("f", { id: "f" }, "e");
      tree.set("g", { id: "g" }, "e");

      expect(tree.entriesOf(["a"], true, true, 1)).toEqual([
        [
          "a",
          { id: "a" },
          [
            ["d", { id: "d" }, []],
            ["e", { id: "e" }, []]
          ]
        ]
      ]);

      expect(tree.entriesOf(["a"], false, true)).toEqual([
        ["d", { id: "d" }, [["h", { id: "h" }, []]]],
        [
          "e",
          { id: "e" },
          [
            ["f", { id: "f" }, []],
            ["g", { id: "g" }, []]
          ]
        ]
      ]);

      expect(tree.entriesOf(["a", "e"], false, true)).toEqual([
        ["f", { id: "f" }, []],
        ["g", { id: "g" }, []]
      ]);

      expect(tree.entriesOf("e", false, true)).toEqual([
        ["f", { id: "f" }, []],
        ["g", { id: "g" }, []]
      ]);

      expect(tree.entriesOf("root", true, true)).toEqual([
        [
          "root",
          { id: "root" },
          [
            ["c", { id: "c" }, []],
            ["b", { id: "b" }, []],
            [
              "a",
              { id: "a" },
              [
                ["d", { id: "d" }, [["h", { id: "h" }, []]]],
                [
                  "e",
                  { id: "e" },
                  [
                    ["f", { id: "f" }, []],
                    ["g", { id: "g" }, []]
                  ]
                ]
              ]
            ]
          ]
        ]
      ]);
    });
  });
});
