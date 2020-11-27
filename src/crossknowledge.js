const { request } = require("./tools");
const querystring = require("querystring");

const HEADERS = {
  Host: process.env.CROSSKNOWLEDGE_HOST,
  "API-KEY": process.env.CROSSKNOWLEDGE_API_KEY,
  "Cache-Control": "no-cache",
  "Content-Type": "application/x-www-form-urlencoded",
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
) => {
  const postData = querystring.stringify({
    login,
    name,
    firstName,
    email,
    entityGuid,
    language,
    referenceNumber,
    customFields: customFields || [],
    status,
    start,
    end,
  });
  console.log("postData", postData);
  return request(
    {
      hostname: process.env.CROSSKNOWLEDGE_HOST,
      path: "/API/ADMIN/v1/REST/Learner/",
      method: "POST",
      headers: HEADERS,
    },
    postData
  );
};
