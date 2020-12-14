const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-west-3" });
const SNS = new AWS.SNS();

module.exports.notifyError = (error, event, context, ...extra) => {
  const date = new Date(event.time);

  const datestring = `${[
    date.getDate(),
    date.getMonth() + 1,
    date.getFullYear(),
  ].join("/")} à ${[date.getHours(), date.getMinutes()].join(":")}`;

  return SNS.publish({
    Message:
      `Bonjour,\n\n` +
      `Vous recevez ce message car une erreur s'est produite sur une fonction hebergée sur AWS.\n\n\n` +
      `Nom de la fonction : "${context.functionName}"\n\n` +
      `Date et heure de l'erreur : "${datestring}"\n\n` +
      `Message de l'erreur : "${error}"\n\n` +
      `Lien du log de la fonction : https://${context.region}.console.aws.amazon.com/lambda/home?region=${context.region}#/functions/${context.functionName}?tab=monitor\n\n` +
      `Lien de désactivation de la Lambda: https://eu-west-3.console.aws.amazon.com/lambda/home?region=eu-west-3#/functions/putTwilioMessagesIntoAirtable_production/aliases/live?tab=configure\n\n` +
      `Informations complémentaires: ${JSON.stringify(
        {
          event,
          context,
          extra,
        },
        null,
        2
      )}\n`,
    TopicArn: process.env.ERROR_TOPIC_ARN,
  }).promise();
};
