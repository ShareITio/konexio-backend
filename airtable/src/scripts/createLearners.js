async () => {
  const config = input.config({
    title: "Configuration de la création d'apprenants",
    description: "Un scrpit permettant de créer de nouveaux apprenant CK.",
    items: [
      input.config.table("learnersTable", {
        label: "La table des apprennants",
      }),
      input.config.view("learnersView", {
        label: "Vue des apprenant à créer",
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
    output.markdown(
      "**Attention, un apprenant ne peut être affilier qu'à un seul groupe. Si plusieurs groupes lui a été affiliés seul le dernier sera pris en considération.**"
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
      id: record.getCellValue("Identifiant"),
      lastName: record.getCellValue("Nom"),
      firstName: record.getCellValue("Prénom"),
      email: record.getCellValue("Email"),
      group: record.getCellValue("Groupe")
        ? record
            .getCellValue("Groupe")
            .reduce((acc, cur) => cur.name, undefined)
        : [],
    }));

    output.markdown("🆙 Envoi des apprenants...");

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
