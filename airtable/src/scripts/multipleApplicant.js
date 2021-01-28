// Créer des comptes apprenants Crossknowledge
const { distanceRatio } = require("../utils/association/ratioProcessing");
const {
  ACCEPTATION_RATIO,
  getRatioExtension,
  translateApplicantKeys,
  prepareBindApplicants,
} = require("../utils/association/tools");
const { loadView } = require("../utils/model");

// retirer le block de la fonction dabs la version build du script pour pouvoir lexecuter dans airtable
(async () => {
  const config = input.config({
    title:
      "Configuration de l'association des candidatures DigitAll, DigitStart et DigitTous à leurs apprenants",
    description:
      "Ce script permet de lier une candidature DigitAll, DigitStart ou DigitTous à sa correspondance dans la table Apprenants. Les paramètres ci-dessous servent à trouver les informations requises à la bonne exécution du script (Il n'est pas nécessaire d'y toucher).",
    items: [
      // Candidatures DigitAll et DigiStart
      input.config.table("candidaturesASTable", {
        label: "📦 Table des candidatures DigitAll & digiStart",
      }),
      input.config.view("nouvelleAllView", {
        label: "👓 Vue des candidatures DigitAll",
        parentTable: "candidaturesASTable",
      }),
      input.config.view("nouvelleStartView", {
        label: "👓 Vue des candidatures DigiStart",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASEmail", {
        label: "🏷️ Champ email des candidatures DigitAll & DigiStart",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASFirstname", {
        label: "🏷️ Champ prénom des candidatures DigitAll & DigiStart",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASLastname", {
        label: "🏷️ Champ nom des candidatures DigitAll & DigiStart",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASPhone", {
        label: "🏷️ Champ téléphone des candidatures DigitAll & DigiStart",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASMultiple", {
        label:
          "🏷️ Champ candidature multiple des candidatures DigitAll & DigiStart",
        parentTable: "candidaturesASTable",
      }),
      input.config.field("candidaturesASDate", {
        label:
          "🏷️ Champ date de candidature des candidatures DigitAll & DigiStart",
        parentTable: "candidaturesASTableDigiTous",
      }),
      input.config.field("candidaturesASStatus", {
        label: "🏷️ Champ status des candidatures DigitAll & DigiStart",
        parentTable: "candidaturesASStatus",
      }),
      // Candidatures DigiTous
      input.config.table("candidaturesASTableDigiTous", {
        label: "📦 Table des candidatures DigiTous",
      }),
      input.config.view("nouvelleTousView", {
        label: "👓 Vue des candidatures DigiTous",
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
      input.config.field("candidaturesASMultipleDigiTous", {
        label: "🏷️ Champ candidature multiple des candidatures DigiTous",
        parentTable: "candidaturesASTableDigiTous",
      }),
      input.config.field("candidaturesASDateDigiTous", {
        label: "🏷️ Champ date de candidature des candidatures DigiTous",
        parentTable: "candidaturesASTableDigiTous",
      }),
      input.config.field("candidaturesASStatusDigiTous", {
        label: "🏷️ Champ status des candidatures DigiTous",
        parentTable: "candidaturesASTableDigiTous",
      }),
      // Candidatures Multiple
      input.config.table("applicantsMultipleTable", {
        label: "📦 Table des candidatures multiple",
      }),
      input.config.view("applicantsMultipleView", {
        label: "👓 Vue des candidatures multiple",
        parentTable: "applicantsMultipleTable",
      }),
      input.config.field("applicantsMultipleDigitAllStart", {
        label:
          "🏷️ Champ candidatures DigitAll & DigiStart des candidatures multiple",
        parentTable: "applicantsMultipleTable",
      }),
      input.config.field("applicantsMultipleDigiTous", {
        label: "🏷️ Champ candidatures DigiTous des candidatures multiple",
        parentTable: "applicantsMultipleTable",
      }),
      input.config.field("applicantsMultipleLearner", {
        label: "🏷️ Champ apprenants des candidatures multiple",
        parentTable: "applicantsMultipleTable",
      }),
    ],
  });

  output.markdown("### Association des candidatures multiples");

  // initialisation
  // Definition du modele commun de données
  const ModelDigitAllStart = {
    lastName: config.candidaturesASLastname,
    firstName: config.candidaturesASFirstname,
    email: config.candidaturesASEmail,
    phone: config.candidaturesASPhone,
    multiple: config.candidaturesASMultiple,
    date: config.candidaturesASDate,
    status: config.candidaturesASStatus,
  };
  const ModelDigiTous = {
    lastName: config.candidaturesASLastnameDigiTous,
    firstName: config.candidaturesASFirstnameDigiTous,
    email: config.candidaturesASEmailDigiTous,
    phone: config.candidaturesASPhoneDigiTous,
    multiple: config.candidaturesASMultipleDigiTous,
    date: config.candidaturesASDateDigiTous,
    status: config.candidaturesASStatusDigiTous,
  };
  const ModelMultiple = {
    digiTous: config.applicantsMultipleDigiTous,
    digitAllStart: config.applicantsMultipleDigitAllStart,
    learner: config.applicantsMultipleLearner,
  };
  const multipleInfo = {
    table: config.applicantsMultipleTable,
    view: config.applicantsMultipleView,
    model: ModelMultiple,
  };
  const applicantsInfos = [
    {
      table: config.candidaturesASTable,
      view: config.nouvelleAllView,
      model: ModelDigitAllStart,
      bind: prepareBindApplicants(multipleInfo),
    },
    {
      table: config.candidaturesASTable,
      view: config.nouvelleStartView,
      model: ModelDigitAllStart,
      bind: prepareBindApplicants(multipleInfo),
    },
    {
      table: config.candidaturesASTableDigiTous,
      view: config.nouvelleTousView,
      model: ModelDigiTous,
      bind: prepareBindApplicants(multipleInfo),
    },
  ];

  // recuperation nouvelle digitAll; digiStart, DigiTous
  const applicantsLoadedFiltered = (
    await Promise.all(applicantsInfos.map(loadView))
  )
    // filtrage des record si deja liés à uyne candidature multiple
    .map(({ values, table, bind }) => ({
      bind,
      table,
      values,
    }));

  const applicants = applicantsLoadedFiltered
    // put every data into one array
    .reduce(
      (acc, { values, table, bind }) => [
        ...acc,
        ...values.map(({ record, data }) => ({
          data,
          record,
          table,
          bind,
        })),
      ],
      []
    )
    // complete data with ratios
    .map(({ data, record, table, bind }, j, result) => {
      const ratios = result
        .map(({ data: applicantData }) => distanceRatio(data, applicantData))
        // filtrage des apprenant respectant la condition et inclusion des données, du record...
        .reduce(
          (acc, ratio, i) =>
            ratio >= ACCEPTATION_RATIO && i !== j
              ? [...acc, { i, ratio }]
              : acc,
          []
        );
      return { data, record, table, ratios, bind };
    });

  output.markdown(
    `ℹ️ Nous avons trouvé ${applicantsLoadedFiltered.reduce(
      (acc, { values }) => acc + values.length,
      0
    )} nouvelles candidatures à vérifier, soi:`
  );
  applicantsLoadedFiltered.forEach(({ values }, i) =>
    output.markdown(
      `- ${values.length} pour "${applicantsInfos[i].view.name}" de "${applicantsInfos[i].table.name}".`
    )
  );

  output.markdown(
    `ℹ️ Pour rappel si aucune équivalence est trouvée, alors nous passerons à la candidature suivante.`
  );
  const binded = {};
  for (const j in applicants) {
    output.markdown(`---`);
    output.markdown(
      `Voici le candidat ${Number(j) + 1}/${applicants.length} de la table "${
        applicants[j].table.name
      }" à comparer: `
    );
    output.table(translateApplicantKeys(applicants[j].data));
    if (binded[j]) {
      output.text(`☑ Ce candidat a été joint avec ${binded[j].name}`);
      continue;
    }
    if (applicants[j].data.multiple && applicants[j].data.multiple.length > 0) {
      output.text("☑ Le candidat à déjà été lié");
      continue;
    }
    if (applicants[j].ratios.length > 0) {
      output.text("👩🏽‍🎓 Apprenants correspondants trouvés");
      output.table(
        applicants[j].ratios.map(({ ratio, i }) => ({
          Identifiant: applicants[i].record.name,
          ...translateApplicantKeys(applicants[i].data),
          Correspondance:
            (ratio * 100).toFixed(0) + "%" + getRatioExtension(ratio),
        }))
      );
      let response = await input.buttonsAsync(
        "Souhaitez-vous associer la 🙋‍♂️ candidature ",
        [
          { label: "Passer", value: "Passer", variant: "secondary" },
          ...applicants[j].ratios.map(({ i }) => ({
            label: applicants[i].record.name,
            value: { i, value: applicants[i] },
          })),
        ]
      );
      if (response !== "Passer") {
        await applicants[j].bind(applicants[j], response.value);
        binded.j = applicants[j];
        binded[response.i] = response.value;
        output.text(
          "✅ La 🙋‍♂️ candidature a été associée à 👩🏽‍🎓 l'apprenant sélectionné "
        );
      } else {
        output.text("☑ On passe au suivant");
      }
    } else {
      output.markdown("☑ Aucune similarité pour ce champs");
    }
  }
})();
