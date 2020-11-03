import { sendSMS, composeMessage, scenarioSMS } from "../utils/tools";
import { getTemplates, getContacts } from "../utils/airtable";

// Pousse à AWS LAMBDA le sms (telephone + message) à envoyer avec template
scenarioSMS(async () => {
  let { name, phone, message } = await getContacts();
  let { message: messageTemplate } = await getTemplates();

  // inclus dans le template le nom de l'utilisateur
  const messageWithName = messageTemplate.replace("#NOM", name);

  await sendSMS(phone, composeMessage(messageWithName, message));
});
