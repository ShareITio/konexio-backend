const AWS = require("aws-sdk");
const { list } = require("../twilio");
const { createMessage, fetchCandidates } = require("../airtableServices");

AWS.config.update({ region: "eu-west-3" });
const SNS = new AWS.SNS();

const MINUTES = 15;

// Fonction permettant de récupérer les sms recu de ces 15 derniere minutes sur Twilio et de les envoyer sur airtable
module.exports.handler = async (event, context) => {
  console.log(event);

  try {
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
  } catch (e) {
    console.error(e);
    const pub = await SNS.publish({
      Message:
        `Une erreur s'est produite lors de l'execution de la la fonction "${context.functionName}" à ${event.time}. Voici le descriptif ci-dessous.\n\n` +
        `Message de l'erreur : "${e}"\n` +
        `Informations complémentaires: ${JSON.stringify({
          event,
          context,
        })}\n` +
        `Lien du log de la fonction : https://eu-west-3.console.aws.amazon.com/lambda/home?region=eu-west-3#/functions/scheduled15?tab=monitor`,
      TopicArn: process.env.ERROR_TOPIC_ARN,
    }).promise();
    console.log(pub);
  }
};
