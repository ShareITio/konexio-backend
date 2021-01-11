const { notifyError } = require("../awsServices");
const { list } = require("../twilio");
const {
  createMessage,
  fetchCandidates,
  fetchMessages,
  dataSchemaMessage,
} = require("../airtableServices");
const {
  MESSAGE_STATUS_TOBETREATED,
  MESSAGE_SCHEDULED_HOURS,
  ENVIRONMENT_PRODUCTION,
} = require("../constants");

// Fonction permettant de récupérer et verifier le bon enregistrement des sms sms recu ces 24 derniere heures sur Twilio et de les envoyer sur airtable
exports.bulkTwilioMessages = async (event, context) => {
  console.log(event, context);
  let messages;
  try {
    const eventTime = new Date(event.time);
    const options = {
      dateSentAfter: new Date(
        eventTime - 1000 * 60 * 60 * MESSAGE_SCHEDULED_HOURS
      ),
      dateSentBefore: eventTime,
    };

    console.log("options :", options);
    const [messageAirtable, candidates, messageTwilio] = await Promise.all([
      // recuperation des messages de ces 24 dernieres heures
      fetchMessages({
        filterByFormula: `IS_AFTER({${dataSchemaMessage.dateReceived}}, DATEADD(NOW(), -${MESSAGE_SCHEDULED_HOURS}, 'hours'))`,
      }),
      // On récupere tous les candidats
      fetchCandidates(),
      // On récupère les sms de ces 15 dernieres minutes
      list(options),
    ]);

    console.log("Twilio messages :", messageTwilio);

    const savedMessages = messageTwilio
      // seulement les messages entrants
      .filter(({ direction }) => direction === "inbound")
      // on compare la presence des messages sur leurs identifiant SID
      .filter(({ sid: sid1 }) =>
        messageAirtable.some(({ sid: sid2 }) => sid1 === sid2)
      );

    // on récupère la différence entre ce bien sauvé et l'ensemble sur twilio
    const messages = messageTwilio.reduce(
      (acc, mes) =>
        savedMessages.some(({ sid }) => mes.sid === sid) ? acc : [...acc, mes],
      []
    );

    if (!messages || messages.length < 1) {
      console.log("No messages received");
      return `No new record created/received.`;
    }

    console.log("Message received :", messages);

    // Envoie les sms vers Airtable
    await Promise.all(
      messages.map(({ from, body, dateSent }) => {
        // Recherche des Candidats ayant envoyé le sms (en fonction du numéro de téléphone)
        const relatedCandidates = candidates
          .filter(({ phone }) => phone === from)
          .map(({ id }) => id);

        console.log(`SMS(${from}) : `, relatedCandidates, body);

        // On écrit ces nouveaux messages lié aux candidats dans la base Airtable
        return createMessage({
          from,
          body,
          status: MESSAGE_STATUS_TOBETREATED,
          to: process.env.TWILIO_PHONE,
          candidates: relatedCandidates,
          dateReceived: dateSent,
        });
      })
    );

    // Tout c'est passé comme sur des roulettes
    return `Record created/received : ${messages.length}`;
  } catch (err) {
    console.error(err);
    if (process.env.PURPOSE === ENVIRONMENT_PRODUCTION) {
      await notifyError(err, event, context, {
        reason: "Voici les SMS que la fonction n'a pas pu enregistrer.",
        data: messages,
      });
    }
    throw err;
  }
};
