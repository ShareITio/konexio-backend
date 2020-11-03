// Pousse à AWS LAMBDA le sms (telephone + message) à envoyer
import { getContacts, sendSMS } from "./tools";

export default async function main() {
  console.log("Envoie du sms en cours...");
  try {
    const { phone, message } = await getContacts();

    sendSMS(phone, message);

    console.log("Le sms a bien été envoyé !");
  } catch (err) {
    console.log("Une erreur s'est produite lors de l'envoie du sms !", err);
  }
}
