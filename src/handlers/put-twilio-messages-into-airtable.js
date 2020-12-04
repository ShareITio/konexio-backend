const { notifyError } = require("../awsServices");
const { list } = require("../twilio");
const { createMessage, fetchCandidates } = require("../airtableServices");

const MINUTES = 15;

// Fonction permettant de récupérer les sms recu de ces 15 derniere minutes sur Twilio et de les envoyer sur airtable
exports.putTwilioMessagesIntoAirtable = async (event, context) => {
  try {
    console.log(event);
    // throw new Error("Attention le chargement des message n'a pas pu se produire.");

    const [candidates, messages] = await Promise.all([
      // On récupere tous les candidats
      fetchCandidates(),
      // On récupère les sms de ces 15 derniere minutes
      list({
        dateSentAfter: new Date(Date.now() - 1000 * (60 * MINUTES)),
      }),
    ]);

    console.log("Candidates :", candidates);

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
          status: "À traiter",
          to: process.env.TWILIO_PHONE,
          candidates: relatedCandidates,
          dateSent,
        });
      })
    );

    // Tout c'est passé comme sur des roulettes
    return `Record created/received : ${messages.length}`;
  } catch (err) {
    console.error(err);
    return notifyError(err, event, context);
  }
};
