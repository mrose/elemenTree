import { Tree } from "../src/tree";

describe(`The delete method`, () => {
  describe(`for trees which have non-distinct node Ids`, () => {
    test(`returns false when the node id requested for deletion does not exist`, () => {
      const tree = Tree.factory({ datum: { id: "root" }, distinct: false });
      tree.set("c", { id: "c" });
      tree.set("b", { id: "b" });
      tree.set("a", { id: "a" });
      expect(tree.delete("x", true)).toBe(false);
      expect(tree.delete(["q", "r", "s"])).toBe(false);
    });

    test(`removes a node and its descendents`, () => {
      const tree = Tree.factory({ datum: { id: "root" }, distinct: false });
      tree.set("c", { id: "c" });
      tree.set("b", { id: "b" });
      tree.set("a", { id: "a" });
      tree.set(["a", "d"], { id: "d" });
      tree.set(["a", "e"], { id: "e" });
      tree.set(["a", "e", "f"], { id: "f" });
      tree.set(["a", "e", "f", "g"], { id: "g" });
      tree.set(["a", "e", "f", "g", "h"], { id: "h" });

      expect(tree.delete(["a", "e", "f", "g", "h"])).toBe(true);
      expect(tree.has(["a", "e", "f", "g", "h"])).toBe(false);

      // when inclusive is false, only descendents are deleted.
      expect(tree.delete(["a", "e"], false)).toBe(true);
      expect(tree.has(["a", "e", "f"])).toBe(false);
      expect(tree.has(["a", "e", "f", "g"])).toBe(false);
      expect(tree.has(["a", "e"])).toBe(true);
    });
  });

  describe(`for trees which have distinct node Ids`, () => {
    test(`returns false when the node id requested for deletion does not exist`, () => {
      const tree = Tree.factory({ datum: { id: "root" }, distinct: true });
      tree.set("c", { id: "c" });
      tree.set("b", { id: "b" });
      tree.set("a", { id: "a" });
      expect(tree.delete("x", true)).toBe(false);
      expect(tree.delete(["q", "r", "s"])).toBe(false);
    });

    test(`removes a node and its descendents`, () => {
      const tree = Tree.factory({ datum: { id: "root" }, distinct: true });
      tree.set("c", { id: "c" });
      tree.set("b", { id: "b" });
      tree.set("a", { id: "a" });
      tree.set("d", { id: "d" }, "a");
      tree.set("e", { id: "e" }, "a");
      tree.set("f", { id: "f" }, "e");
      tree.set("g", { id: "g" }, "f");
      tree.set("h", { id: "h" }, "g");

      expect(tree.delete("h")).toBe(true);
      expect(tree.has("h")).toBe(false);
      expect(tree.has(["a", "e", "f", "g", "h"])).toBe(false);

      // when inclusive is false, only descendents are deleted.
      expect(tree.delete("e", false)).toBe(true);
      expect(tree.has("f")).toBe(false);
      expect(tree.has("g")).toBe(false);
      expect(tree.has("e")).toBe(true);
      expect(tree.has(["a", "e", "f", "g"])).toBe(false);
      expect(tree.has(["a", "e", "f"])).toBe(false);
      expect(tree.has(["a", "e"])).toBe(true);
    });
  });
});
