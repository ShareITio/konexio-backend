const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  makeReturn,
  getInfo,
} = require("../tools");
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
          group,
          // password,
        } = data;
        return createLearner(id, {
          name,
          firstName,
          email,
          status: "Y",
          language: "fr-FR",
          entityGuid: "101B1F43-2D44-0AAC-CDA6-F4B8ED66F385", // Konexio entity
          customFields: [
            {
              "5BD8779F-BD3A-6F83-A44B-3CF77D67B2C2": group,
            },
          ],
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
