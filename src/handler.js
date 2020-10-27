const { create, list } = require("./twilio");
const {
  ERROR_RETURN,
  SUCCESS_RETURN,
  makeReturn,
  getInfo,
} = require("./tools");

const get = async ({ limit = 2 }) =>
  makeReturn(await list(limit), SUCCESS_RETURN);

const post = async ({ to, body }) => {
  if (to && body) return makeReturn(await create(to, body), SUCCESS_RETURN);
  return makeReturn(
    "Invalid body. In order to send an sms you need the 'to' and 'body' attributes.",
    ERROR_RETURN
  );
};

module.exports.default = async (event, context) => {
  try {
    const { httpMethod, body } = getInfo(event, context);

    if (httpMethod === "GET") return get(body);
    if (httpMethod === "POST") return post(body);
    return makeReturn(`Unsupported "${httpMethod}".`, ERROR_RETURN);
  } catch (error) {
    console.error(error);
    return makeReturn("An error as occured.", ERROR_RETURN);
  }
};
