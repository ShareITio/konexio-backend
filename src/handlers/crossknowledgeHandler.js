const { notifyError } = require("../awsServices");
const { getInfo } = require("../tools");
const { createLearner } = require("../crossknowledge");

module.exports.handler = async (event, context) => {
  console.log(event);

  try {
    const {
      httpMethod,
      body: { data, endpoint },
    } = getInfo(event, context);

    if (httpMethod === "POST" && endpoint === "Learner") {
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
    }
    return `Nothing to do.`;
  } catch (err) {
    console.error(err);
    return notifyError(err, event, context);
  }
};
