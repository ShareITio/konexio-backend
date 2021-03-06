const AWS = require("aws-sdk");

AWS.config.update({ region: "eu-west-3" });
const SNS = new AWS.SNS();
const region = "eu-west-3";
module.exports.notifyError = (error, event, context, ...extra) => {
  const date = new Date();

  const datestring = `${[
    date.getDate(),
    date.getMonth() + 1,
    date.getFullYear(),
  ].join("/")} à ${[date.getHours(), date.getMinutes()].join(":")}`;

  const message =
    `Bonjour,\n\n` +
    `Vous recevez ce message car une erreur s'est produite sur une fonction hebergée sur AWS.\n\n\n` +
    `Nom de la fonction : "${context.functionName}"\n\n` +
    `Date et heure de l'erreur : "${datestring}"\n\n` +
    `Message de l'erreur : "${error}"\n\n` +
    `Lien du log de la fonction : https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${context.functionName}?tab=monitor\n\n` +
    `Lien de désactivation de la Lambda: https://${region}.console.aws.amazon.com/lambda/home?region=${region}#/functions/${context.functionName}/aliases/live?tab=configure\n\n` +
    `Informations complémentaires: ${JSON.stringify(
      { error, event, context, extra },
      null,
      2
    )}\n`;

  return process.env.PURPOSE === "production"
    ? SNS.publish({
        Message: message,
        TopicArn: process.env.ERROR_TOPIC_ARN,
      }).promise()
    : async () => console.log("SNS.publish", message);
};
