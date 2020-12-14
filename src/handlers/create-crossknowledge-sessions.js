const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  makeReturn,
  makeCORSReturn,
  getInfo,
} = require("../tools");
const { notifyError } = require("../awsServices");
const { createSession, registerSession } = require("../crossknowledge");

// Créé des session avec utilisateurs enregistrés dans crossknowledge
exports.createCrossknowledgeSessions = async (event, context) => {
  // if (event.httpMethod == "OPTIONS") {
  //   return makeCORSReturn();
  // }

  try {
    const {
      body: { data },
    } = getInfo(event, context);

    const result = await Promise.all(
      data.map(async (data, i) => {
        console.log(i, data);
        const { trainingGUID, learners, title, start, end, welcomeText } = data;
        const sessionResponse = await createSession(trainingGUID, {
          title,
          start,
          end,
          welcomeText,
        });
        const { guid: sessionGUID } = sessionResponse.value[0];
        return Promise.all(
          learners.map(async ({ guid: learnerGUID }) => {
            await registerSession(sessionGUID, learnerGUID);
          })
        );
      })
    );
    if (result.every(({ message }) => message === "OK")) {
      console.log(result);
      return makeReturn(`Added ${result.length}`, STATUS_SUCCESS);
    }
    throw result;
  } catch (reason) {
    console.error(reason);
    await notifyError(reason, event, context);
    return makeReturn("An error as occured.", STATUS_ERROR);
  }
};
