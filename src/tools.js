const https = require("https");

module.exports.request = (options, chunk) =>
  new Promise((resolve, reject) => {
    const client = https
      .request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", (error) => reject(error));

    if (chunk) {
      client.write(chunk);
    }

    return client.end();
  });

module.exports.STATUS_ERROR = "400";

module.exports.STATUS_SUCCESS = "200";

module.exports.makeReturn = (body, statusCode) => {
  console.log("Return : ", statusCode, JSON.stringify(body, null, 2));
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE,HEAD,PATCH",
    },
  };
};

module.exports.getInfo = (event) => {
  console.log("Received event : ", JSON.stringify(event, null, 2));
  return {
    // REST API or HTTP API
    httpMethod: event.httpMethod || event.requestContext.http.method,
    body: !event.body ? {} : JSON.parse(event.body),
  };
};
