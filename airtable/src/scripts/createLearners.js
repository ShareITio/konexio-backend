async () => {
  let table = base.getTable("Comptes CK");
  let query = await table.selectRecordsAsync();

  output.table(query.records);

  const learners = query.records.map((record) => ({
    id: record.getCellValue("Identifiant"),
    name: record.getCellValue("Nom"),
    firstName: record.getCellValue("Prénom"),
    email: record.getCellValue("email"),
    group: record.getCellValue("Groupe"),
  }));

  const result = await fetch(process.env.AWS_LAMBDA, {
    method: "POST",
    body: JSON.stringify({
      data: learners,
      endpoint: "LEARNERS",
    }),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY,
    },
  });

  output.inspect(result);
};
