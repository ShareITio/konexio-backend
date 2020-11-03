/**
 * Récupère le record actuel ou invite l'utilisateur à en entrer un.
 * @param {string} name
 * @return {Promise<Record>}
 */
export async function makeRecords(name) {
  let table = base.getTable(name);
  return input.recordAsync("Choisissez un champs " + name, table);
}

/**
 * Récupération du contact et de ses champs formatés
 */
export async function getContacts() {
  const record = await makeRecords("Contacts");
  return {
    name: record.getCellValue("Nom"),
    phone: record.getCellValue("Téléphone"),
    message: record.getCellValue("Message"),
  };
}

/**
 * Récupération du template sms et de ses champs formatés
 */
export async function getTemplates() {
  const record = await makeRecords("Templates");
  return {
    name: record.getCellValue("Name"),
    message: record.getCellValue("Message"),
  };
}

/**
 * Compose le corps du sms
 * @param {string} message Le template
 * @param {string} altMessage Le message personnalisé
 */
export function composeMessage(message, altMessage) {
  return `${message}\n${altMessage}`;
}
