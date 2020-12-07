const { create, list } = require("../../../src/twilio");
const {
  putTwilioMessagesIntoAirtable,
} = require("../../../src/handlers/put-twilio-messages-into-airtable");

jest.mock("../../../src/twilio", () => ({
  create: jest.fn(() => true),
  list: jest.fn(() => []),
}));

describe.skip("should select the good request type", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should choose GET", async () => {
    const res = await putTwilioMessagesIntoAirtable({ httpMethod: "GET" });
    expect(list).toHaveBeenCalled();
    expect(res.statusCode).toEqual("200");
  });

  it("should choose POST", async () => {
    const res = await putTwilioMessagesIntoAirtable({
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
