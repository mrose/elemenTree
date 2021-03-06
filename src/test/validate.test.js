import { validate } from "../tree";

describe(`validate function`, () => {
  test(`validate throws on invalid path`, () => {
    expect(() => validate(1, {}).toBe([]));
  });

  test(`validate throws on invalid condition`, () => {
    expect(() => validate(3, { showRoot: "goo" })).toThrow();

    //.toThrowWithMessage(`all persons more than a mile high to leave the court`);
  });
  test(`validate returns on valid condition`, () => {
    expect(validate(3, { showRoot: "auto" })).toBe("auto");
  });
});
