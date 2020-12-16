const { request } = require("./tools");
const querystring = require("querystring");

const HEADERS = {
  Host: process.env.CROSSKNOWLEDGE_HOST,
  "API-KEY": process.env.CROSSKNOWLEDGE_API_KEY,
  "Cache-Control": "no-cache",
  "Content-Type": "application/x-www-form-urlencoded",
};

module.exports.getLearner = (guid) =>
  request({
    hostname: process.env.CROSSKNOWLEDGE_HOST,
    path: `/API/ADMIN/v1/REST/Learner/${guid}/`,
    method: "GET",
    headers: HEADERS,
  });

module.exports.getTrainings = async () => {
  let path = "/API/ADMIN/v1/REST/Training/?limit=50";
  let data = [];
  let response = {};

  do {
    response = await request({
      hostname: process.env.CROSSKNOWLEDGE_HOST,
      path,
      method: "GET",
      headers: HEADERS,
    });
    if (response.message === "OK") {
      data = [...data, ...response.value];
      if (response.totalCount > response.count) {
        path = response.next;
      }
    } else break; // securité en cas d'erreur
  } while (response.totalCount > response.count);

  return data;
};

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
    status,
    start,
    end,
    ...Object.keys(customFields).reduce((acc, guid) => {
      acc[`customFields[${guid}]`] = customFields[guid];
      return acc;
    }, {}),
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

module.exports.createSession = ({
  title,
  start,
  end,
  welcomeText,
  trainingGUID,
}) => {
  const postData = querystring.stringify({ title, start, end, welcomeText });
  console.log("postData", postData);
  return request(
    {
      hostname: process.env.CROSSKNOWLEDGE_HOST,
      path: `/API/ADMIN/v1/REST/Training/${trainingGUID}/Session/`,
      method: "POST",
      headers: HEADERS,
    },
    postData
  );
};

module.exports.registerSession = (sessionGUID, learnerGUID) =>
  request({
    hostname: process.env.CROSSKNOWLEDGE_HOST,
    path: `/API/ADMIN/v1/REST/Session/${sessionGUID}/Register/${learnerGUID}/`,
    method: "POST",
    headers: HEADERS,
  });
