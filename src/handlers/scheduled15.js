const { STATUS_SUCCESS, makeReturn } = require("../tools");
const { list } = require("../twilio");
const { makeCreate, makeSchema } = require("../airtable");

const MINUTES = 15;

function formattedDate(d = new Date()) {
  return [d.getDate(), d.getMonth() + 1, d.getFullYear()]
    .map((n) => (n < 10 ? `0${n}` : `${n}`))
    .join("/");
}

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
      `Record created/receive : ${receive.length}`,
      STATUS_SUCCESS
    );
  } catch (err) {
    console.error(err);
    return makeReturn(err, 400);
  }
};
