const { makeFetcher, makeCreate, makeSchema } = require("./airtable");

const schemaMessage = {
  to: "Numéro Konexio de réception",
  from: "Numéro d'envoi",
  body: "Contenu du message",
  dateSent: "Date et heure de réception",
  status: "Statut du message",
  learners: "Candidatures apprenants liées au numéro",
};
module.exports.createMessage = makeCreate(
  "Messages",
  makeSchema(schemaMessage, (name) =>
    schemaMessage.dateSent === name
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
  "Toutes les candidatures",
  makeSchema(schemaCandidate, (name) => (data) => data.get(name))
);
