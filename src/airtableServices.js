const { makeFetcher, makeCreate, makeSchema } = require("./airtable");

const schemaMessage = {
  to: "Numéro Konexio de réception",
  from: "Numéro d'envoi",
  body: "Contenu du message",
  status: "Statut du message",
  candidates: "Candidatures apprenants liées au numéro",
  dateReceived: "Date et heure de réception",
  dateSent: "Date et heure d'envoi",
};
module.exports.createMessage = makeCreate(
  "Messages",
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
  "Candidatures DigitAll et DigiStart",
  "Master view",
  makeSchema(schemaCandidate, (name) => (data) => data.get(name))
);
