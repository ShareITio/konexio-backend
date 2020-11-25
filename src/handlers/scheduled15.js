const AWS = require("aws-sdk");
const { list } = require("../twilio");
const { createMessage, fetchCandidates } = require("../airtableServices");

AWS.config.update({ region: "eu-west-3" });
const SNS = new AWS.SNS();

const MINUTES = 15;

// Fonction permettant de récupérer les sms recu de ces 15 derniere minutes sur Twilio et de les envoyer sur airtable
module.exports.handler = async (event, context) => {
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

    const date = new Date(event.time);

    const datestring = `${[
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear(),
    ].join("/")} à ${[date.getHours(), date.getMinutes()].join(":")}`;

    const pub = await SNS.publish({
      Message:
        `Bonjour,\n\n` +
        `Vous recevez ce message car une erreur s'est produite sur une fonction hebergée sur AWS.\n\n\n` +
        `Nom de la fonction : "${context.functionName}"\n\n` +
        `Date et heure de l'erreur : "${datestring}"\n\n` +
        `Message de l'erreur : "${err}"\n\n` +
        `Lien du log de la fonction : https://eu-west-3.console.aws.amazon.com/lambda/home?region=eu-west-3#/functions/scheduled15?tab=monitor\n\n` +
        `Informations complémentaires: ${JSON.stringify(
          {
            event,
            context,
          },
          null,
          2
        )}\n`,
      TopicArn: process.env.ERROR_TOPIC_ARN,
    }).promise();
    console.log(pub);
  }
};
