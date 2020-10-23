export const makeReturn = (body, statusCode) => ({
  body,
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
});
