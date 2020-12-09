async () => {
  try {
    let table = base.getTable("Comptes CK");
    let view = table.getView("Comptes CK à créer");
    let query = await view.selectRecordsAsync();

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

    const response = await fetch(
      "https://uuzuwr0ba0.execute-api.eu-west-3.amazonaws.com/default/konexio",
      {
        method: "POST",
        body: JSON.stringify({
          data: learners,
          endpoint: "LEARNERS",
        }),
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "n8J7PbPspS80OzQPZRveN7FbMwyap46lFBwkX3Si",
        },
      }
    );

    const { message, data } = await response.json();

    output.text("Les apprenants ont bien été enregistrés !");
    output.text(`Réponse serveur : ${message}`);
    output.inspect(data);

    await table.updateRecordsAsync(
      query.records.map((record, i) => ({
        id: record.id,
        fields: {
          "Compte CK créé": true,
          GUID: data[i].guid,
        },
      }))
    );
  } catch (err) {
    console.error(
      "Une erreur s'est produite lors de l'enregistrement : ",
      err.message
    );
  }
};
