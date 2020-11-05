const { create, list } = require("../twilio");
const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  makeReturn,
  getInfo,
} = require("../tools");

module.exports.handler = async (event, context) => {
  try {
    const {
      httpMethod,
      body: { limit = 2, to, body },
    } = getInfo(event, context);

    switch (httpMethod) {
      case "GET":
        return makeReturn(await list(limit), STATUS_SUCCESS);
      case "POST":
        if (to && body) {
          return makeReturn(await create(to, body), STATUS_SUCCESS);
        }
        return makeReturn(
          "Invalid body. In order to send an sms you need the 'to' and 'body' attributes.",
          STATUS_ERROR
        );
      default:
        return makeReturn(`Unsupported "${httpMethod}".`, STATUS_ERROR);
    }
  } catch (error) {
    console.error(error);
    return makeReturn("An error as occured.", STATUS_ERROR);
  }
};
