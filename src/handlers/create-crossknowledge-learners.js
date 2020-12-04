const { create } = require("../twilio");
const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  makeReturn,
  getInfo,
} = require("../tools");
const { getTrainings, getTrainingSession } = require("../crossknowledge");
const { notifyError } = require("../awsServices");
const { createLearner } = require("../crossknowledge");

// Créé des comptes apprenants dans crossknowledge
exports.createCrossknowledgeLearners = async (event, context) => {
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
          // customFields: {
          //   "f114870d-ed13-4e03-bc77-c34841a7a52b": "France",
          //   "d941cf5f-00a8-4e8d-804e-f913e6aad471": "IT",
          // },
          //   group,
          //   password,
          // },
        });
      })
    );
    if (result.every(({ message }) => message === "OK")) {
      console.log(result);
      return makeReturn(`Added ${result.length}`, STATUS_SUCCESS);
    }
    throw result;
  } catch (reason) {
    console.error(reason);
    // await notifyError(reason, event, context);
    return makeReturn("An error as occured.", STATUS_ERROR);
  }
};
