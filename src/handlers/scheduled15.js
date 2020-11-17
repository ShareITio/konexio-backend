const { STATUS_SUCCESS, makeReturn } = require("../tools");
const { list } = require("../twilio");
const { makeFetcher, makeCreate, makeSchema } = require("../airtable");

const MINUTES = 15;

const schemaMessage = {
  to: "Numéro Konexio de réception",
  from: "Numéro d'envoi",
  body: "Contenu du message",
  dateSent: "Date et heure de réception",
  status: "Statut du message",
  learners: "Apprenant lié au numéro",
};
const createMessage = makeCreate(
  "Messages",
  makeSchema(schemaMessage, (name) =>
    schemaMessage.dateSent === name
      ? (data) => data.toISOString()
      : (data) => data
  )
);

const schemaLearner = {
  phone: "Téléphone",
};
const fetchLearners = makeFetcher(
  "Candidatures DigitAll et DigiStart",
  "Toutes les candidatures",
  makeSchema(schemaLearner, (name) => (data) => data.get(name))
);

module.exports.handler = async (event) => {
  console.log(event);

  try {
    const [learners, receive] = await Promise.all([
      fetchLearners(),
      list({
        limit: 3,
        // dateSentAfter: new Date(Date.now() - 1000 * (60 * MINUTES)),
      }),
    ]);

    await Promise.all(
      receive.map(({ from, body, dateSent }) => {
        console.log("Adding to airtable MESSAGE", from, body);
        console.log(
          learners.filter(({ phone }) => phone === from).map(({ id }) => id)
        );

        return createMessage({
          from,
          body,
          // dateSent,
          status: "À traiter",
          to: process.env.TWILIO_PHONE,
          learners: learners
            .filter(({ phone }) => phone === from)
            .map(({ id }) => id),
        });
      })
    );

    return makeReturn(
      `Record created/received : ${receive.length}`,
      STATUS_SUCCESS
    );
  } catch (err) {
    console.error(err);
    return makeReturn(err, 400);
  }
};
