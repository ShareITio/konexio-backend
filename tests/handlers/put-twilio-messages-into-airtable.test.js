const { create, list } = require("../../src/twilio");
const {
  putTwilioMessagesIntoAirtable,
} = require("../../src/handlers/put-twilio-messages-into-airtable");

// jest.mock("../../../src/twilio", () => ({
//   create: jest.fn(() => true),
//   list: jest.fn(() => []),
// }));

describe("should select the good request type", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should get all messages from 15/12", async () => {
    console.log("enter");
    const messages = await list({
      dateSentAfter: new Date("2020-12-18T16:08:00.000Z"),
      dateSentBefore: new Date("2020-12-18T16:24:17.952Z"),
    });
    console.log(
      messages.map(({ body, dateSent, from, direction }) => ({
        body,
        dateSent,
        from,
        direction,
      }))
    );

    expect(messages.length).toBeGreaterThan(0);
  });

  it.skip("should choose GET", async () => {
    const res = await putTwilioMessagesIntoAirtable({ httpMethod: "GET" });
    expect(list).toHaveBeenCalled();
    expect(res.statusCode).toEqual("200");
  });

  it.skip("should choose POST", async () => {
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
