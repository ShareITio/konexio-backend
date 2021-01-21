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
        label: "📦 Table des apprenants",
      }),
      input.config.view("apprenantsView", {
        label: "👁️ Vue des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.field("apprenantsEmail", {
        label: "🏷️ Champ email des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.field("apprenantsFirstname", {
        label: "🏷️ Champ prénom des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.field("apprenantsLastname", {
        label: "🏷️ Champ nom des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.field("apprenantsPhone", {
        label: "🏷️ Champ téléphone des apprenants",
        parentTable: "apprenantsTable",
      }),
      input.config.table("candidaturesASTable", {
        label: "📦 Table des candidatures DigitAll & DigitStart",
      }),
      // input.config.table("candidaturesASTableDigitTous", {
      //   label: "📦 Table des candidatures DigitTous",
      // }),
      input.config.view("nouvelleAllView", {
        label: "👁️ Vue des candidatures DigitAll",
        parentTable: "candidaturesASTable",
      }),
      input.config.view("nouvelleStartView", {
        label: "👁️ Vue des candidatures DigitStart",
        parentTable: "candidaturesASTable",
      }),
      // input.config.view("nouvelleTousView", {
      //   label: "👁️ Vue des candidatures DigitTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
      input.config.field("candidaturesASEmail", {
        label: "🏷️ Champ email des candidatures",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASFirstname", {
        label: "🏷️ Champ prénom des candidatures",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASLastname", {
        label: "🏷️ Champ nom des candidatures",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASPhone", {
        label: "🏷️ Champ téléphone des candidatures",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASLearners", {
        label: "🏷️ Champ fiche apprenants des candidatures",
        parentTable: "candidaturesASTable",
      }),

      // input.config.field("candidaturesASEmailDigiTous", {
      //   label: "🏷️ Champ email des candidatures DigiTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
      // input.config.field("candidaturesASFirstnameDigiTous", {
      //   label: "🏷️ Champ prénom des candidatures DigiTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
      // input.config.field("candidaturesASLastnameDigiTous", {
      //   label: "🏷️ Champ nom des candidatures DigiTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
      // input.config.field("candidaturesASPhoneDigiTous", {
      //   label: "🏷️ Champ téléphone des candidatures DigiTous",
      //   parentTable: "candidaturesASTableDigitTous",
      // }),
    ],
  });

  output.markdown(
    "### Associer des candidatures avec des apprenants existants"
  );

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
    learners: record.getCellValue(config.candidaturesASLearners),
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
