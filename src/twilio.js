const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports.create = async (to, body) =>
  client.messages.create({ from: process.env.TWILIO_PHONE, body, to });

module.exports.list = async (limit) => client.messages.list({ limit });
