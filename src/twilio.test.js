const { create, list } = require("./twilio");

it("should get sms list", async () => {
  const result = await list(1);
  expect(result).toBeDefined();
});

it("should post sms", async () => {
  const result = await create("+33781700715", "un test");
  expect(result).toBeDefined();
});
