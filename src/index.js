const AWS = require("aws-sdk");
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_ACCOUNT_SID
);
const { makeReturn } = require("./tools");

const post = async ({ from, body, to }) => {
  return makeReturn(await client.messages.create({ from, body, to }), "200");
};

const get = async () => {
  return makeReturn(await client.messages.list({ limit: 20 }), "200");
};

export const handler = (event, context) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (event.httpMethod === "GET") {
    return get(event.body);
  }
  if (event.httpMethod === "POST") {
    return post(event.body);
  }

  return makeReturn(`Unsupported method "${event.httpMethod}"`, "400");
};
