// Créer des comptes apprenants Crossknowledge

// Repeter pour digitall digistart digitous
// 1. recuperation de la vue Nouvelle
// 2. Comparaison avec la table Apprenant (algo lenvenstein)
// 3. Montrer les record concordant avec un certain pourcentage
// 4. Action: 1.passer ou 2.lier
// 4.1.1 Suivant
// 4.2.1 Action: choisir les records "input.recordAsync" sur concordant
// 4.2.2 Lier candidature à apprenant

const { distanceRatio } = require("../utils/association/ratioProcessing");
const {
  ACCEPTATION_RATIO,
  getRatioExtension,
  translateApplicantKeys,
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
      input.config.field("candidaturesASMultiple", {
        label: "🏷️ Champ candidature multiple des candidatures DigiTous",
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
  };
  const ModelDigitTous = {
    lastName: config.candidaturesASLastnameDigiTous,
    firstName: config.candidaturesASFirstnameDigiTous,
    email: config.candidaturesASEmailDigiTous,
    phone: config.candidaturesASPhoneDigiTous,
    multiple: config.candidaturesASMultipleDigiTous,
  };

  const applicantsInfos = [
    {
      table: config.candidaturesASTable,
      view: config.nouvelleAllView,
      model: ModelDigitAllStart,
    },
    {
      table: config.candidaturesASTable,
      view: config.nouvelleStartView,
      model: ModelDigitAllStart,
    },
    {
      table: config.candidaturesASTableDigiTous,
      view: config.nouvelleTousView,
      model: ModelDigitTous,
    },
  ];

  // recuperation nouvelle digitAll; digitStart, DigiTous
  const applicantsLoadedFiltered = (
    await Promise.all(applicantsInfos.map(loadView))
  )
    // filtrage des record si deja liés à uyne candidature multiple
    .map(({ values, table }) => ({
      table,
      values: values.filter(
        ({ data: { multiple } }) => !(multiple && multiple.length > 0)
      ),
    }));
  console.log(applicantsLoadedFiltered);

  const applicants = applicantsLoadedFiltered
    // put every data into one array
    .reduce(
      (acc, { values, table }) => [
        ...acc,
        ...values.map(({ record, data }) => ({
          data: data,
          record: record,
          table: table,
        })),
      ],
      []
    )
    // complete data with ratios
    .map(({ data, record, table }, j, result) => {
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
      return { data, record, table, ratios };
    });
  console.log(applicants);

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

  for (const j in applicants) {
    output.markdown(`---`);
    output.markdown(
      `Voici le candidat ${Number(j) + 1}/${applicants.length} à comparer: `
    );
    output.table(translateApplicantKeys(applicants[j].data));
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
            value: applicants[i].record,
          })),
        ]
      );
      if (response !== "Passer") {
        await bind(applicants[j].record, [response]);
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
