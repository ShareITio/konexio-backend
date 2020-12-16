async () => {
  const config = input.config({
    title: "Configuration",
    description: "Un scrpit permettant de créer de nouveaux apprenant CK",
    items: [
      input.config.table("learnersTable", {
        label: "La table des apprennants",
        // description: 'The table in which you track orders for your store'
      }),
      input.config.view("learnersView", {
        label: "Vue des apprenant à créer",
        // description: 'La vue des apprenant à créer',
        parentTable: "learnersTable",
      }),
      input.config.text("APIurl", {
        label: "Point de terminaison d’API",
      }),
      input.config.text("APIkey", {
        label: "Clé API",
      }),
    ],
  });

  try {
    output.markdown("### Création des comptes apprenants Crossknowledge");

    let query = await config.learnersView.selectRecordsAsync();

    const learners = query.records.map((record) => ({
      id: record.getCellValue("Identifiant"),
      lastName: record.getCellValue("Nom"),
      firstName: record.getCellValue("Prénom"),
      email: record.getCellValue("Email"),
      group: record.getCellValue("Groupe"),
    }));

    output.markdown("Liste des apprenants à créer :");
    output.table(learners);
    output.markdown("Envoi de la liste vers Crossknowledge via Lambda...");

    const response = await fetch(config.APIurl, {
      method: "POST",
      body: JSON.stringify({
        data: learners,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": config.APIkey,
      },
    });

    const responseData = await response.json();
    if (responseData.data) {
      output.markdown(
        "✅ Les comptes apprenants ont bien été créés dans Crossknowledge !"
      );
      output.markdown("Mise a jour des apprenants dans Airtable...");

      await config.learnersTable.updateRecordsAsync(
        query.records.map((record, i) => ({
          id: record.id,
          fields: {
            "Compte CK créé": true,
            GUID: responseData.data[i].guid,
          },
        }))
      );
      output.text(
        "✅ Identifiants Crossknowledge des apprenants mis à jour dans Airtable."
      );
    } else {
      throw responseData;
    }
  } catch (err) {
    output.markdown("---");
    output.markdown("❌ Une erreur s'est produite lors de l'enregistrement.");
    output.markdown(
      "Veuillez contacter votre administrateur Konexio (📧 [airtable@konexio.eu](mailto:airtable@konexio.eu))."
    );
    throw err;
  }
};
