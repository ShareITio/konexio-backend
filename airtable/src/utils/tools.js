/**
 * Compose le corps du sms
 * @param {string} message Le template
 * @param {string} altMessage Le message personnalisé
 */
export function composeMessage(message, altMessage) {
  return `${message}\n${altMessage}`;
}

export function sendSMS(phone, message) {
  const body = {
    to: phone,
    body: message,
  };
  console.log(body);

  // envoie le message à AWS
  return fetch(process.env.AWS_LAMBDA, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY,
    },
  });
}

export async function scenarioSMS(callback) {
  try {
    console.log("Envoie du sms en cours...");

    await callback();

    console.log("Le sms a bien été envoyé !");
  } catch (err) {
    console.log("Une erreur s'est produite lors de l'envoie du sms !", err);
  }
}
