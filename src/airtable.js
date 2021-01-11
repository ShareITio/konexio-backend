const Airtable = require("airtable");

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base(process.env.AIRTABLE_BASE);

const getFields = (table) => Object.keys(table).map((key) => table[key].name);

const getValueBySchema = (record, schema) =>
  Object.keys(schema).reduce((acc, key) => {
    acc[key] = schema[key].get(record);
    return acc;
  }, {});

const UNKNOWN = "Unknown";
module.exports.UNKNOWN = UNKNOWN;

/**
 * Prépare la récupération d'un champs en fonction d'un record
 * @param {String} name nom du champs airtable
 * @param {String} type Type souhaité. Peut etre null
 */
module.exports.makeGetValue = (name, type = undefined) => (record) =>
  type ? type(record.get(name)) : record.get(name);

/**
 * Prépare la récupération des données en fonction d'un record et selon un tableau de string
 * Si la valeur du champs de record ne correspond à aucune valeurs dans from, retourne null
 * Utile pour les champs selecteur de airtable
 * @param {String} name nom du champs airtable
 * @param {Array<String>} from
 */
module.exports.makeGetValueByConstant = (name, from) => (record) =>
  from.reduce((prev, cur) => {
    const value = record.get(name);
    if (cur === value) return value;
    if (prev !== UNKNOWN) return prev;
    return UNKNOWN;
  });

/**
 * Créé le schema de données airtable -> app; pour les méthodes makeFetcher et makeCreate
 * @param {Object} fields objet ayant pour clefs les attributs en sortie de récuperation de données et pour valeurs le nom du champs airtable
 * @param {Function} makeGet prend en parametre un nom de champs et doit retourner une fonction permettant de le gerer
 */
module.exports.makeSchema = (fields, makeGet) =>
  Object.keys(fields).reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: {
        name: fields[cur],
        get: makeGet(fields[cur]),
      },
    }),
    {}
  );

/**
 * Prépare la  récupération des données airtable
 * @returns {Function} la fonction de récupération des données retournant une promesse renvoyant soi les données soi une erreure
 * @param {String} table La table souhaité
 * @param {String} view La vue souhaité
 * @param {Object} schema Schema des données
 */
module.exports.makeFetcher = (table, view, schema) => (options = {}) => {
  // Si vous vous retrouvez avec une erreur de type :
  // "TypeError: Cannot read property 'offset' of undefined",
  // Votre schema est sans doute erroné
  const accumulator = [];
  return new Promise((resolve, reject) =>
    base(table)
      .select({
        fields: getFields(schema),
        view,
        ...options,
      })
      .eachPage(
        (records, fetchNextPage) => {
          // on charge chaque page
          accumulator.push(
            records.map((record) => ({
              id: record.id,
              ...getValueBySchema(record, schema),
            }))
          );

          fetchNextPage();
        },
        (err) => {
          if (err === null) {
            // à la place de `.flat` qui remontait une erreur "offset..."
            const res = accumulator.reduce((acc, cur) => [...acc, ...cur], []);
            return resolve(res); // on retourne toutes les pages
          }
          return reject(err);
        }
      )
  );
};

/**
 * Envoyer des données vers le airtable
 * @param {String} table La table souhaité
 * @param {String} schema Schema des données
 */

module.exports.makeCreate = (table, schema) => (data) => {
  return new Promise((resolve, reject) =>
    base(table).create(
      [
        {
          fields: Object.keys(data).reduce((acc, key) => {
            acc[schema[key].name] = schema[key].get(data[key]);
            return acc;
          }, {}),
        },
      ],
      (err, records) => {
        if (err === null) {
          return resolve(records);
        }
        return reject(err);
      }
    )
  );
};
