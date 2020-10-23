const { create, list } = require("./twilio");
const { makeReturn } = require("./tools");

module.exports.handler = async (event, context) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (event.httpMethod === "GET") {
    return makeReturn(await list(2), "200");
  }
  if (event.httpMethod === "POST") {
    return makeReturn(await create(event.body.body, event.body.to), "200");
  }
  return makeReturn(`Unsupported method "${event.httpMethod}"`, "400");
};
