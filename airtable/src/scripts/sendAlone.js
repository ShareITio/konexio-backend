import { scenarioSMS, sendSMS } from "../utils/tools";
import { getContacts } from "../utils/airtable";

// Pousse à AWS LAMBDA le sms (telephone + message) à envoyer
scenarioSMS(async () => {
  const { phone, message } = await getContacts();

  return sendSMS(phone, message);
});
