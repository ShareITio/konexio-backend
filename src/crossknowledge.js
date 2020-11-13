const { request } = require("./tools");

module.exports.getTrainings = () =>
  request({
    hostname: process.env.CROSSKNOWLEDGE_HOST,
    path: "/API/ADMIN/v1/REST/Training/",
    method: "GET",
    headers: {
      Host: process.env.CROSSKNOWLEDGE_HOST,
      "API-KEY": process.env.CROSSKNOWLEDGE_API_KEY,
      "Cache-Control": "no-cache",
    },
  });

module.exports.getTrainingSession = (guid) =>
  request({
    hostname: process.env.CROSSKNOWLEDGE_HOST,
    path: `/API/ADMIN/v1/REST/Training/${guid}/Session/`,
    method: "GET",
    headers: {
      Host: process.env.CROSSKNOWLEDGE_HOST,
      "API-KEY": process.env.CROSSKNOWLEDGE_API_KEY,
      "Cache-Control": "no-cache",
    },
  });
