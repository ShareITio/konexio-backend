const { STATUS_SUCCESS, makeReturn, formattedDate } = require("../tools");
const { list } = require("../twilio");
const { makeCreate, makeSchema } = require("../airtable");

const MINUTES = 15;

const schemaMessage = {
  from: "Téléphone",
  body: "Message",
  dateSent: "Date d'envoie",
};
const createMessage = makeCreate(
  "SMS",
  makeSchema(schemaMessage, (name) =>
    schemaMessage.dateSent === name ? formattedDate : (data) => data
  )
);

module.exports.handler = async (event) => {
  console.log(event);

  try {
    const receive = await list({
      dateSentAfter: new Date(Date.now() - 1000 * (60 * MINUTES)),
    });

    await Promise.all(
      receive.map(({ from, body, dateSent }) => {
        console.log("Adding to airtable MESSAGE", from, body);
        return createMessage({ from, body, dateSent });
      })
    );

    return makeReturn(
      `Record created/received : ${receive.length}`,
      STATUS_SUCCESS
    );
  } catch (err) {
    console.error(err);
    return makeReturn(err, 400);
  }
};
