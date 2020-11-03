// Pousse à AWS LAMBDA le sms (telephone + message) à envoyer avec template
import { sendSMS, getTemplates, getContacts, composeMessage } from "./tools";

export default async function main() {
  console.log("Envoie du sms en cours...");
  try {
    let { name, phone, message } = await getContacts();
    let { message: messageTemplate } = await getTemplates();

    // inclus dans le template le nom de l'utilisateur
    const messageWithName = messageTemplate.replace("#NOM", name);

    sendSMS(phone, composeMessage(messageWithName, message));

    console.log("Le sms a bien été envoyé !");
  } catch (err) {
    console.log("Une erreur s'est produite lors de l'envoie du sms !", err);
  }
}
