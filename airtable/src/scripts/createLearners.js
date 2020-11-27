async () => {
  try {
    let table = base.getTable("Comptes CK");
    let query = await table.selectRecordsAsync();

    const learners = query.records.map((record) => ({
      id: record.getCellValue("Identifiant"),
      lastName: record.getCellValue("Nom"),
      firstName: record.getCellValue("Prénom"),
      email: record.getCellValue("Email"),
      group: record.getCellValue("Groupe"),
      password: record.getCellValue("Mot de passe"),
    }));

    output.text("Enregistrement des apprenants en cours...");
    output.table(learners);

    const response = await fetch(process.env.AWS_LAMBDA, {
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

    output.text("Les apprenants ont bien été enregistrés !");
    output.text(`Réponse serveur : ${await response.text()}`);
  } catch (err) {
    console.error("Une erreur s'est produite lors de l'enregistrement : ", err);
  }
};
