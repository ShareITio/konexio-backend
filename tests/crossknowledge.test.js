const { addFacilitatorsSession } = require("../src/crossknowledge");

jest.mock("../src/tools", () => ({
  request: jest.fn((o1, o2) => {
    o1, o2;
  }),
}));
test("should make a good data return request", () => {
  const res = addFacilitatorsSession("60342BF4-686A-794B-843C-EF081E1A28BE", [
    "CD718719-F99F-7154-94C3-95DB8F7A2A22",
    "CD718719-F99F-7154-94C3-95DB8F7AA2ds",
  ]);
  console.log(res);
  //  expect(res.statusCode).toBe(statusCode);
});
