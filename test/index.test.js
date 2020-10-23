const { create, list } = require("../src/twilio");
const { handler } = require("../src/index");

jest.mock("../src/twilio", () => ({
  create: jest.fn(() => true),
  list: jest.fn(() => []),
}));

describe("should select the good request type", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should choose GET", async () => {
    const res = await handler({ httpMethod: "GET" });
    expect(list).toHaveBeenCalled();
    expect(res.statusCode).toEqual("200");
  });

  it("should choose POST", async () => {
    const res = await handler({
      httpMethod: "POST",
      body: {
        body: "test: un message",
        to: "+33781700715",
      },
    });
    expect(create).toHaveBeenCalled();
    expect(res.statusCode).toEqual("200");
  });
});
