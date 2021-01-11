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
module.exports.dataSchemaMessage = dataSchemaMessage;
module.exports.createMessage = makeCreate(
  process.env.AIRTABLE_MESSAGE_TABLE,
  makeSchema(dataSchemaMessage, (name) =>
    dataSchemaMessage.dateReceived === name
      ? (data) => data.toISOString()
      : (data) => data
  )
);
module.exports.fetchMessages = makeFetcher(
  process.env.AIRTABLE_MESSAGE_TABLE,
  "Tous les messages",
  makeSchema(dataSchemaMessage, (name) => (data) => data.get(name))
);

const dataSchemaCandidate = {
  phone: "Téléphone",
  messageReceived: "Messages reçus",
};
module.exports.dataSchemaCandidate = dataSchemaCandidate;
module.exports.fetchCandidates = makeFetcher(
  process.env.AIRTABLE_CANDIDATES_TABLE,
  "Master view",
  makeSchema(dataSchemaCandidate, (name) => (data) => data.get(name))
);
