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
module.exports.handler = async (event, context) => {
  try {
    const {
      httpMethod,
      body: { to, body, guid, data, endpoint },
    } = getInfo(event, context);

    switch (httpMethod) {
      case "GET":
        if (guid)
          return makeReturn(await getTrainingSession(guid), STATUS_SUCCESS);
        return makeReturn(await getTrainings(), STATUS_SUCCESS);
      case "POST":
        if (data && endpoint) {
          if (endpoint === "LEARNERS") {
            try {
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
          }
          return makeReturn(`Nothing to do.`, STATUS_ERROR);
        }
        if (to && body) {
          return makeReturn(await create(to, body), STATUS_SUCCESS);
        }
        return makeReturn(
          "Invalid body. In order to send an sms you need the 'to' and 'body' attributes.",
          STATUS_ERROR
        );
      default:
        return makeReturn(`Unsupported "${httpMethod}".`, STATUS_ERROR);
    }
  } catch (error) {
    console.error(error);
    return makeReturn("An error as occured.", STATUS_ERROR);
  }
};
