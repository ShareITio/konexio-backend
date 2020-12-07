const { makeReturn } = require("../../src/tools");

test("should make a good data return request", () => {
  const body = "My body";
  const statusCode = "300";

  const res = makeReturn(body, statusCode);
  expect(res.body).toBe(`"${body}"`);
  expect(res.statusCode).toBe(statusCode);
});
