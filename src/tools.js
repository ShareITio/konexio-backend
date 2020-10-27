module.exports.ERROR_RETURN = "400";
module.exports.SUCCESS_RETURN = "200";

module.exports.makeReturn = (body, statusCode) => {
  console.log("Return : ", statusCode, JSON.stringify(body, null, 2));
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
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
