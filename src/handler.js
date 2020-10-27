const { create, list } = require("./twilio");
const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  makeReturn,
  getInfo,
} = require("./tools");

const get = async ({ limit = 2 }) =>
  makeReturn(await list(limit), STATUS_SUCCESS);

const post = async ({ to, body }) => {
  if (to && body) return makeReturn(await create(to, body), STATUS_SUCCESS);
  return makeReturn(
    "Invalid body. In order to send an sms you need the 'to' and 'body' attributes.",
    STATUS_ERROR
  );
};

module.exports.default = async (event, context) => {
  try {
    const { httpMethod, body } = getInfo(event, context);

    if (httpMethod === "GET") return get(body);
    if (httpMethod === "POST") return post(body);
    return makeReturn(`Unsupported "${httpMethod}".`, STATUS_ERROR);
  } catch (error) {
    console.error(error);
    return makeReturn("An error as occured.", STATUS_ERROR);
  }
};
