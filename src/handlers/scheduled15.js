const { STATUS_SUCCESS, makeReturn } = require("../tools");

module.exports.handler = async (event, context) => {
  console.log(event, context);
  return makeReturn(
    { to: "+33781700715", body: "Damn on m'a trigger !" },
    STATUS_SUCCESS
  );
};
