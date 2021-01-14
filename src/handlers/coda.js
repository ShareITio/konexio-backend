const {
  createMessage,
  fetchCandidates,
  fetchMessages,
  dataSchemaMessage,
} = require("../airtableServices");

exports.handler = async (event, context) => {
  console.log(event, context);
};
