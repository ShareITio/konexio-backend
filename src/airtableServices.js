const { makeFetcher, makeCreate, makeSchema } = require("./airtable");

const dataSchemaMessage = {
  to: "Numéro Konexio de réception",
  from: "Numéro d'envoi",
  body: "Contenu du message",
  status: "Statut du message",
  candidates: "Candidatures apprenants liées au numéro",
  dateReceived: "Date et heure de réception",
  sid: "SID",
};
const schemaMessage = makeSchema(dataSchemaMessage, (name) =>
  dataSchemaMessage.dateReceived === name
    ? (data) => data.toISOString()
    : (data) => data
);

module.exports.createMessage = makeCreate(
  process.env.AIRTABLE_MESSAGE_TABLE,
  schemaMessage
);
module.exports.fetchMessages = makeFetcher(
  process.env.AIRTABLE_MESSAGE_TABLE,
  "Tous les messages",
  schemaMessage
);

const dataSchemaCandidate = {
  phone: "Téléphone",
  messageReceived: "Messages reçus",
};
module.exports.fetchCandidates = makeFetcher(
  process.env.AIRTABLE_CANDIDATES_TABLE,
  "Master view",
  makeSchema(dataSchemaCandidate, (name) => (data) => data.get(name))
);
