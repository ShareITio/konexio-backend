const { makeFetcher, makeCreate, makeSchema } = require("./airtable");

const schemaMessage = {
  to: "Numéro Konexio de réception",
  from: "Numéro d'envoi",
  body: "Contenu du message",
  status: "Statut du message",
  candidates: "Candidatures apprenants liées au numéro",
  dateReceived: "Date et heure de réception",
  uri: "URI",
};
module.exports.createMessage = makeCreate(
  process.env.AIRTABLE_MESSAGE_TABLE,
  makeSchema(schemaMessage, (name) =>
    schemaMessage.dateSent === name || schemaMessage.dateReceived === name
      ? (data) => data.toISOString()
      : (data) => data
  )
);
module.exports.fetchMessages = makeFetcher(
  process.env.AIRTABLE_MESSAGE_TABLE,
  "Tous les messages",
  makeSchema(schemaMessage, (name) =>
    schemaMessage.dateSent === name || schemaMessage.dateReceived === name
      ? (data) => data.toISOString()
      : (data) => data
  )
);

const schemaCandidate = {
  phone: "Téléphone",
  messageReceived: "Messages reçus",
};
module.exports.fetchCandidates = makeFetcher(
  process.env.AIRTABLE_CANDIDATES_TABLE,
  "Master view",
  makeSchema(schemaCandidate, (name) => (data) => data.get(name))
);
