async () => {
  // Créer des comptes apprenants Crossknowledge
  const config = input.config({
    title: "Configuration de la création d'apprenants",
    description:
      "Ce script permet de créer de nouveaux apprenants dans CrossKnowledge. Les paramètres ci-dessous servent à trouver les informations requises à la bonne exécution du script (Il n'est pas nécessaire d'y toucher).",
    items: [
      input.config.table("learnersTable", {
        label: "Table des apprennants",
      }),
      input.config.view("learnersView", {
        label: "Vue des apprenants à créer",
        parentTable: "learnersTable",
      }),
      input.config.field("learnerId", {
        label: "Champs identifiant des apprenants",
        parentTable: "learnersTable",
      }),
      input.config.field("learnerEmail", {
        label: "Champs email des apprenants",
        parentTable: "learnersTable",
      }),
      input.config.field("learnerFirstname", {
        label: "Champs prénom des apprenants",
        parentTable: "learnersTable",
      }),
      input.config.field("learnerLastname", {
        label: "Champs nom des apprenants",
        parentTable: "learnersTable",
      }),
      input.config.field("learnerGroup", {
        label: "Champs groupe des apprenants",
        parentTable: "learnersTable",
      }),
    ],
  });

  try {
    output.markdown("### Création des comptes apprenants Crossknowledge");
    output.markdown(
      "**Attention, un apprenant ne peut être affilié qu'à un seul groupe. Si plusieurs groupes lui ont été affilié seul le dernier sera pris en considération.**"
    );
    let { records } = await config.learnersView.selectRecordsAsync();

    if (records.length < 1) {
      output.markdown("---");
      output.markdown(
        `🆗 Aucun compte à créer dans la vue "${config.learnersView.name}".`
      );
      // @ts-ignore
      return;
    }

    output.markdown("Liste des apprenants à créer :");
    output.table(records);

    const learners = records.map((record) => ({
      id: record.getCellValue(config.learnerId),
      lastName: record.getCellValue(config.learnerLastname),
      firstName: record.getCellValue(config.learnerFirstname),
      email: record.getCellValue(config.learnerEmail),
      group: record.getCellValue(config.learnerGroup)
        ? record
            .getCellValue(config.learnerGroup)
            .reduce((acc, cur) => cur.name, undefined)
        : [],
    }));

    output.markdown("🆙 Envoi des apprenants...");

    const response = await fetch(process.env.LAMBDA_API_URL_LEARNERS, {
      method: "POST",
      body: JSON.stringify({
        data: learners,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": process.env.LAMBDA_API_KEY,
      },
    });

    const responseData = await response.json();
    if (responseData.data) {
      output.markdown(
        "✅ Les comptes apprenants ont bien été créés dans Crossknowledge."
      );
      await config.learnersTable.updateRecordsAsync(
        records.map((record, i) => ({
          id: record.id,
          fields: {
            "Compte CK créé": true,
            GUID: responseData.data[i].guid,
            Identifiant: responseData.data[i].login,
          },
        }))
      );
      output.text("✅ Les apprenants ont bien été mis à jour dans Airtable.");
    } else {
      throw responseData;
    }
    output.markdown("---");
    output.text(`🆗 Tous les apprenants ont bien été créées.`);
  } catch (err) {
    output.markdown("---");
    output.markdown("❌ Une erreur s'est produite lors de l'enregistrement.");
    output.markdown(
      "Veuillez contacter votre administrateur Konexio (📧 [airtable@konexio.eu](mailto:airtable@konexio.eu))."
    );
    throw err;
  }
};
