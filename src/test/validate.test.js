import { validate } from "../tree";

describe(`validate function`, () => {
  test(`validate throws on invalid condition`, () => {
    expect(() => validate(3, { show_root: "goo" })).toThrow();

    //.toThrowWithMessage(`all persons more than a mile high to leave the court`);
  });
  test(`validate returns on valid condition`, () => {
    expect(validate(3, { show_root: "auto" })).toBe("auto");
  });
});
