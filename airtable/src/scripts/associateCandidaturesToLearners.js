// Créer des comptes apprenants Crossknowledge

// Repeter pour digitall digistart digitous
// 1. recuperation de la vue Nouvelle
// 2. Comparaison avec la table Apprenant (algo lenvenstein)
// 3. Montrer les record concordant avec un certain pourcentage
// 4. Action: 1.passer ou 2.lier
// 4.1.1 Suivant
// 4.2.1 Action: choisir les records "input.recordAsync" sur concordant
// 4.2.2 Lier candidature à apprenant

// const { scenarioSearchDuplicates } = require("../utils/association/scenario");
const { distanceRatio } = require("../utils/association/ratioProcessing");
const {
  translateApplicantKeys,
  translateLearnerKeys,
  getRatioExtension,
  ACCEPTATION_RATIO,
  logVerificationStats,
  logApplicantToCompare,
  logCompareResult,
} = require("../utils/association/tools");
const { makeUpdateRecord, loadView } = require("../utils/model");
// retirer le block de la fonction dabs la version build du script pour pouvoir lexecuter dans airtable
(async () => {
  const config = input.config({
    title:
      "Configuration de l'association des candidatures DigitAll, DigitStart et DigitTous à leurs apprenants",
    description:
      "Ce script permet de lier une candidature DigitAll, DigitStart ou DigitTous à sa correspondance dans la table Apprenants. Les paramètres ci-dessous servent à trouver les informations requises à la bonne exécution du script (Il n'est pas nécessaire d'y toucher).",
    items: [
      // Apprenants
      input.config.table("apprenantsTable", {
        label: "📦 Table des apprenants",
      }),
      input.config.view("apprenantsView", {
        label: "👓 Vue des apprenants",
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
      // Candidatures DigitAll et DigiStart
      input.config.table("candidaturesASTable", {
        label: "📦 Table des candidatures digitAll & digiStart",
      }),
      input.config.view("nouvelleAllView", {
        label: "👓 Vue des candidatures digitAll",
        parentTable: "candidaturesASTable",
      }),
      input.config.view("nouvelleStartView", {
        label: "👓 Vue des candidatures digitStart",
        parentTable: "candidaturesASTable",
      }),
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
      // Candidatures DigiTous
      input.config.table("candidaturesASTableDigiTous", {
        label: "📦 Table des candidatures DigiTous",
      }),
      input.config.view("nouvelleTousView", {
        label: "👓 Vue des candidatures DigiTous",
        parentTable: "candidaturesASTableDigiTous",
      }),
      input.config.field("candidaturesASLearnersDigiTous", {
        label: "🏷️ Champ fiche apprenants des candidatures",
        parentTable: "candidaturesASTableDigiTous",
      }),
      input.config.field("candidaturesASEmailDigiTous", {
        label: "🏷️ Champ email des candidatures DigiTous",
        parentTable: "candidaturesASTableDigiTous",
      }),
      input.config.field("candidaturesASFirstnameDigiTous", {
        label: "🏷️ Champ prénom des candidatures DigiTous",
        parentTable: "candidaturesASTableDigiTous",
      }),
      input.config.field("candidaturesASLastnameDigiTous", {
        label: "🏷️ Champ nom des candidatures DigiTous",
        parentTable: "candidaturesASTableDigiTous",
      }),
      input.config.field("candidaturesASPhoneDigiTous", {
        label: "🏷️ Champ téléphone des candidatures DigiTous",
        parentTable: "candidaturesASTableDigiTous",
      }),
    ],
  });

  output.markdown("### Association candidatures apprenants");

  // initialisation
  // Definition du modele commun de données
  const ModelDigitAllStart = {
    lastName: config.candidaturesASLastname,
    firstName: config.candidaturesASFirstname,
    email: config.candidaturesASEmail,
    phone: config.candidaturesASPhone,
    learners: config.candidaturesASLearners,
  };
  const ModelDigitTous = {
    lastName: config.candidaturesASLastnameDigiTous,
    firstName: config.candidaturesASFirstnameDigiTous,
    email: config.candidaturesASEmailDigiTous,
    phone: config.candidaturesASPhoneDigiTous,
    learners: config.candidaturesASLearnersDigiTous,
  };
  const ModelLearner = {
    lastName: config.apprenantsLastname,
    firstName: config.apprenantsFirstname,
    email: config.apprenantsEmail,
    phone: config.apprenantsPhone,
  };

  const learnerInfos = {
    table: config.apprenantsTable,
    view: config.apprenantsView,
    model: ModelLearner,
  };
  const applicantsInfos = [
    {
      table: config.candidaturesASTable,
      view: config.nouvelleAllView,
      model: ModelDigitAllStart,
      bind: makeUpdateRecord(
        config.candidaturesASTable,
        ModelDigitAllStart.learners
      ),
    },
    {
      table: config.candidaturesASTable,
      view: config.nouvelleStartView,
      model: ModelDigitAllStart,
      bind: makeUpdateRecord(
        config.candidaturesASTable,
        ModelDigitAllStart.learners
      ),
    },
    {
      table: config.candidaturesASTableDigiTous,
      view: config.nouvelleTousView,
      model: ModelDigitTous,
      bind: makeUpdateRecord(
        config.candidaturesASTableDigiTous,
        ModelDigitTous.learners
      ),
    },
  ];

  // recuperation des apprenants
  const learners = await loadView(learnerInfos);

  // recuperation nouvelle digitAll; digitStart, DigiTous
  const applicantsByView = (await Promise.all(applicantsInfos.map(loadView)))
    // filtrage des record si deja liés
    .map(({ values, table, view, bind }) => ({
      bind,
      table,
      view,
      values: values.filter(
        ({ data: { learners } }) => !(learners && learners.length > 0)
      ),
    }));

  const applicants = applicantsByView
    // mise à plat
    .reduce((acc, { values, table, bind }) => {
      return [
        ...acc,
        ...values.map(({ data, record }) => ({
          data,
          record,
          table,
          bind,
        })),
      ];
    }, [])
    // complete data with ratios
    .map(({ data, record, table, bind }) => {
      const ratios = learners.values
        .map(({ data: learnerData }) => distanceRatio(data, learnerData))
        // filtrage des apprenant respectant la condition et inclusion des données, du record...
        .reduce(
          (acc, ratio, i) =>
            ratio >= ACCEPTATION_RATIO ? [...acc, { i, ratio }] : acc,
          []
        );
      return { data, record, table, ratios, bind };
    });

  logVerificationStats(applicantsByView);

  for (const j in applicants) {
    logApplicantToCompare(applicants, j, ModelLearner);
    // todo: next si l'index du record à deja ete ajouté
    if (applicants[j].ratios.length > 0) {
      // output.text(`${learners.table.name} correspondants trouvés :`);
      logCompareResult(applicants[j], learners.values, ModelLearner);
      let response = await input.buttonsAsync(
        `Souhaitez-vous associer la " ${applicants[j].table.name}" ?`,
        [
          { label: "Passer", value: "Passer", variant: "secondary" },
          ...applicants[j].ratios.map(({ i }) => ({
            label: learners.values[i].record.name,
            value: learners.values[i],
          })),
        ]
      );
      if (response !== "Passer") {
        await applicants[j].bind(applicants[j].record, [response.record]);
        // output.text(
        //   `✅ La "${applicants[j].table.name}" a été associée au record "${learners.table.name}" sélectionné`
        // );
        output.markdown(
          `✅ La "${applicants[j].table.name}" *${applicants[j].record.name}* a été associée à la "${learnerInfos.table.name}" *${response.record.name}*.`
        );
      } else {
        output.text("☑ On passe au suivant");
      }
    } else {
      output.markdown("✖️ Aucune correspondance pour cette candidature");
    }
  }
  output.markdown("✅ Toutes les candidatures ont été vérifiées.");
})();
