// Créer des comptes apprenants Crossknowledge

// Repeter pour digitall digistart digitous
// 1. recuperation de la vue Nouvelle
// 2. Comparaison avec la table Apprenant (algo lenvenstein)
// 3. Montrer les record concordant avec un certain pourcentage
// 4. Action: 1.passer ou 2.lier
// 4.1.1 Suivant
// 4.2.1 Action: choisir les records "input.recordAsync" sur concordant
// 4.2.2 Lier candidature à apprenant

const { scenarioSearchDuplicates } = require("../utils/association/scenario");

// retirer le block de la fonction dabs la version build du script pour pouvoir lexecuter dans airtable
(async () => {
  const config = input.config({
    title: "Configuration du lien candidatures/apprenants",
    // todo mettre à jour la description
    description:
      "TODO: Ce script permet de créer de nouveaux apprenants dans CrossKnowledge. Les paramètres ci-dessous servent à trouver les informations requises à la bonne exécution du script (Il n'est pas nécessaire d'y toucher).",
    items: [
      input.config.table("apprenantsTable", {
        label: "Table des apprenants",
      }),
      input.config.view("apprenantsView", {
        label: "Vue des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.field("apprenantsEmail", {
        label: "Champs email des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.field("apprenantsFirstname", {
        label: "Champs prénom des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.field("apprenantsLastname", {
        label: "Champs nom des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.field("apprenantsPhone", {
        label: "Champs téléphone des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.table("candidaturesASTable", {
        label: "Table des candidatures digitAll & digitStart",
      }),
      // input.config.table("candidaturesASTableDigitTous", {
      //   label: "Table des candidatures digitTous",
      // }),
      input.config.view("nouvelleAllView", {
        label: "Vue des candidatures digitAll",
        parentTable: "candidaturesASTable",
      }),
      input.config.view("nouvelleStartView", {
        label: "Vue des candidatures digitStart",
        parentTable: "candidaturesASTable",
      }),
      // input.config.view("nouvelleTousView", {
      //   label: "Vue des candidatures digitTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
      input.config.field("candidaturesASEmail", {
        label: "Champs email des candidatures",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASFirstname", {
        label: "Champs prénom des candidatures",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASLastname", {
        label: "Champs nom des candidatures",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASPhone", {
        label: "Champs téléphone des candidatures",
        parentTable: "candidaturesASTable",
      }),
      // input.config.field("candidaturesASEmailDigiTous", {
      //   label: "Champs email des candidatures DigiTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
      // input.config.field("candidaturesASFirstnameDigiTous", {
      //   label: "Champs prénom des candidatures DigiTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
      // input.config.field("candidaturesASLastnameDigiTous", {
      //   label: "Champs nom des candidatures DigiTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
      // input.config.field("candidaturesASPhoneDigiTous", {
      //   label: "Champs téléphone des candidatures DigiTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
    ],
  });

  output.markdown("### Association candidatures apprenants");

  // initialisation
  // todo: ajouter une jolie description
  // recuperer les données de digitous et digitStart
  // recuperation nouvelle digitall
  const {
    records: digitAllRecords,
  } = await config.nouvelleAllView.selectRecordsAsync();
  const digitAllData = digitAllRecords.map((record) => ({
    lastName: record.getCellValue(config.candidaturesASLastname),
    firstName: record.getCellValue(config.candidaturesASFirstname),
    email: record.getCellValue(config.candidaturesASEmail),
    phone: record.getCellValue(config.candidaturesASPhone),
  }));
  output.markdown("✅ Vue des nouvelles candidatures DigitAll chargée.");

  // recuperation apprenants
  const {
    records: learnersRecord,
  } = await config.apprenantsView.selectRecordsAsync();
  const learnersData = learnersRecord.map((record) => ({
    id: record.id,
    lastName: record.getCellValue(config.apprenantsLastname),
    firstName: record.getCellValue(config.apprenantsFirstname),
    email: record.getCellValue(config.apprenantsEmail),
    phone: record.getCellValue(config.apprenantsPhone),
  }));
  output.markdown("✅ Vue des nouvelles apprenants chargée.");

  // todo afficher le nombre de candidatures à lier

  const views = [{ records: digitAllRecords, data: digitAllData }];
  output.markdown(
    `ℹ️ Il y a ${views.reduce(
      (acc, { records }) => acc + records.length,
      0
    )} record à vérifier. *On passera prochainement les candidats déjà liés à au moins un apprenant.*`
  );
  for (const j in views) {
    const view = views[j];
    await scenarioSearchDuplicates(view, learnersData, learnersRecord);
  }
  output.markdown("✅ Tous les records ont été vérifiés.");
})();
