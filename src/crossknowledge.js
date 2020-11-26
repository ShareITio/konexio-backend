const { request } = require("./tools");

const HEADERS = {
  Host: process.env.CROSSKNOWLEDGE_HOST,
  "API-KEY": process.env.CROSSKNOWLEDGE_API_KEY,
  "Cache-Control": "no-cache",
};

module.exports.getTrainings = () =>
  request({
    hostname: process.env.CROSSKNOWLEDGE_HOST,
    path: "/API/ADMIN/v1/REST/Training/",
    method: "GET",
    headers: HEADERS,
  });

module.exports.getTrainingSession = (guid) =>
  request({
    hostname: process.env.CROSSKNOWLEDGE_HOST,
    path: `/API/ADMIN/v1/REST/Training/${guid}/Session/`,
    method: "GET",
    headers: HEADERS,
  });

module.exports.createLearner = (
  login,
  {
    name,
    firstName,
    email,
    entityGuid,
    language,
    referenceNumber,
    customFields,
    status,
    start,
    end,
  }
) =>
  request({
    hostname: process.env.CROSSKNOWLEDGE_HOST,
    path: `/API/ADMIN/v1/REST/Learner/`,
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      login,
      name,
      firstName,
      email,
      entityGuid,
      language,
      referenceNumber,
      customFields,
      status,
      start,
      end,
    }),
  });
