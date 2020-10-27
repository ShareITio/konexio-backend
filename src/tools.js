module.exports.STATUS_ERROR = "400";

module.exports.STATUS_SUCCESS = "200";

module.exports.makeReturn = (body, statusCode) => {
  console.log("Return : ", statusCode, JSON.stringify(body, null, 2));
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "https://airtable.com",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE,HEAD,PATCH",
    },
  };
};

module.exports.getInfo = (event) => {
  console.log("Received event : ", JSON.stringify(event, null, 2));
  return {
    // REST API or HTTP API
    httpMethod: event.httpMethod || event.requestContext.http.method,
    body: JSON.parse(event.body),
  };
};
