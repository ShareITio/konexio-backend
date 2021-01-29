async () => {
  // Envoyer les sessions Airtable vers Crossknowledge
  const config = input.config({
    title: "Configuration de la création des sessions à partir des groupes",
    description:
      "Les paramètres ci-dessous servent à trouver les informations requises à la bonne exécution du script (Il n'est pas nécessaire d'y toucher).",
    items: [
      input.config.table("groupTable", {
        label: "Table des groupes",
      }),
      input.config.view("groupView", {
        label: "Vue des groupes",
        parentTable: "groupTable",
      }),
      input.config.field("groupeTime", {
        label: "Champ des Jours/Horaires des groupes",
        parentTable: "groupTable",
      }),
      input.config.field("groupFacilitator", {
        label: "Champ bénévoles animateurs des groupes",
        parentTable: "groupTable",
      }),
      input.config.field("groupSession", {
        label: "Champ des scéances des groupes",
        parentTable: "groupTable",
      }),
      input.config.field("groupStart", {
        label: "Champ date de début des groupes",
        parentTable: "groupTable",
      }),
      input.config.field("groupEnd", {
        label: "Champ date de fin des groupes",
        parentTable: "groupTable",
      }),
      input.config.field("sessionWelcomeText", {
        label: "Champs texte de bienvenue des groupes",
        parentTable: "groupTable",
      }),
      input.config.field("sessionLearners", {
        label: "Champs des apprenants des groupes",
        parentTable: "groupTable",
      }),
      input.config.field("sessionProgram", {
        label: "Champs du programme des groupes",
        parentTable: "groupTable",
      }),
    ],
  });

  try {
    output.markdown("### Création des sessions à partir des groupes");
  } catch (err) {
    output.markdown("---");
    output.markdown("❌ Une erreur s'est produite lors de l'enregistrement.");
    output.markdown(
      "Veuillez contacter votre administrateur Konexio (📧 [airtable@konexio.eu](mailto:airtable@konexio.eu))."
    );
    throw err; // affichage de l'erreur
  }
};
