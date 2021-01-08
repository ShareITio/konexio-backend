const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  makeReturn,
  getInfo,
} = require("../tools");
const { notifyError } = require("../awsServices");
const { createLearner } = require("../crossknowledge");
const {
  CROSSKNOWLEDGE_KONEXIO_ENTITY,
  CROSSKNOWLEDGE_CUSTOMFIELDS_GROUP,
  CROSSKNOWLEDGE_STATUS_OK,
  CROSSKNOWLEDGE_LANGUAGE,
  ENVIRONMENT_PRODUCTION,
} = require("../constants");

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
          status: CROSSKNOWLEDGE_STATUS_OK,
          language: CROSSKNOWLEDGE_LANGUAGE,
          entityGuid: CROSSKNOWLEDGE_KONEXIO_ENTITY,
          customFields: {
            [CROSSKNOWLEDGE_CUSTOMFIELDS_GROUP]: group,
          },
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
    if (process.env.PURPOSE === ENVIRONMENT_PRODUCTION) {
      await notifyError(reason, event, context);
    }
    return makeReturn("An error as occured.", STATUS_ERROR);
  }
};
