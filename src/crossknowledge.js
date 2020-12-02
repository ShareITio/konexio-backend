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

const process = { env: { API: "79F26E1B-B96A-9DFA-DC20-299E8D3EEF93" } };

async function sso(param) {
  function sha512(str) {
    return crypto.subtle
      .digest("SHA-512", new TextEncoder("utf-8").encode(str))
      .then((buf) => {
        return Array.prototype.map
          .call(new Uint8Array(buf), (x) => ("00" + x.toString(16)).slice(-2))
          .join("");
      });
  }
  const hash = await sha512(`${process.env.API}${param}`);
  return `https://konexio.eu.crossknowledge.com/sso/${param}hash/${hash}`;
}

sso(
  "identity_field/login/login/johann.test/email/j.hospice@share-it.io/verify_email/yes/register/yes/"
).then(console.log);
