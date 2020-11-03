// Pousse à AWS LAMBDA le sms (telephone + message) à envoyer avec template
import { getTemplates, getContacts, composeMessage } from "./tools";

export default async function main() {
  console.log("Envoie du sms en cours...");
  try {
    let contact = await getContacts();
    let { message } = await getTemplates();

    // inclus dans le template le nom de l'utilisateur
    const messageWithName = message.replace("#NOM", contact.name);

    const body = {
      to: contact.phone,
      body: composeMessage(messageWithName, contact.message),
    };
    console.log(body);

    // envoie le message à AWS
    await fetch(process.env.AWS_LAMBDA, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AWS_API_KEY,
      },
    });

    console.log("Le sms a bien été envoyé !");
  } catch (err) {
    console.log("Une erreur s'est produite lors de l'envoie du sms !", err);
  }
}
