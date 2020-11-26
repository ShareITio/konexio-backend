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
          if (endpoint === "Learner") {
            try {
              const result = await Promise.all(
                data.map((data, i) => {
                  console.log(i, data);
                  const {
                    id,
                    lastName: name,
                    firstName,
                    email,
                    group,
                    password,
                  } = data;

                  return createLearner(id, {
                    name,
                    firstName,
                    email,
                    customFields: {
                      group,
                      password,
                    },
                  });
                })
              );

              console.log(result);
              return `Added ${result.length}`;
            } catch (err) {
              console.error(err);
              return notifyError(err, event, context);
            }
          }
          return `Nothing to do.`;
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
