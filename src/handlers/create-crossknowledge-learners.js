const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  makeReturn,
  makeCORSReturn,
  getInfo,
} = require("../tools");
const { notifyError } = require("../awsServices");
const { createLearner } = require("../crossknowledge");

// Créé des comptes apprenants dans crossknowledge
exports.createCrossknowledgeLearners = async (event, context) => {
  if (event.httpMethod == "OPTIONS") {
    return makeCORSReturn();
  }

  try {
    const {
      body: { data },
    } = getInfo(event, context);

    const result = await Promise.all(
      data.map((data, i) => {
        console.log(i, data);
        const {
          id,
          lastName: name,
          firstName,
          email,
          // group,
          // password,
        } = data;
        return createLearner(id, {
          name,
          firstName,
          email,
          status: "Y",
          language: "fr-FR",
          entityGuid: "101B1F43-2D44-0AAC-CDA6-F4B8ED66F385", // Konexio entity
        });
      })
    );
    if (result.every(({ message }) => message === "OK")) {
      console.log(result);
      return makeReturn(
        {
          message: `Added ${result.length}`,
          data: result.map(({ value }) => ({
            guid: value[0].guid,
            login: value[0].login,
          })),
        },
        STATUS_SUCCESS
      );
    }
    throw result;
  } catch (reason) {
    console.error(reason);
    await notifyError(reason, event, context);
    return makeReturn("An error as occured.", STATUS_ERROR);
  }
};
