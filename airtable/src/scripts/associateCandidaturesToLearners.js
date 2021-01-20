const Levenshtein = require("levenshtein");

async () => {
  // Créer des comptes apprenants Crossknowledge

  // Repeter pour digitall digistart digitous
  // 1. recuperation de la vue Nouvelle
  // 2. Comparaison avec la table Apprenant (algo lenvenstein)
  // 3. Montrer les record concordant avec un certain pourcentage
  // 4. Action: 1.passer ou 2.lier
  // 4.1.1 Suivant
  // 4.2.1 Action: choisir les records "input.recordAsync" sur concordant
  // 4.2.2 Lier candidature à apprenant

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
      input.config.table("candidaturesASTableDigitTous", {
        label: "Table des candidatures digitTous",
      }),
      input.config.view("nouvelleAllView", {
        label: "Vue des candidatures digitAll",
        parentTable: "candidaturesASTable",
      }),
      input.config.view("nouvelleStartView", {
        label: "Vue des candidatures digitStart",
        parentTable: "candidaturesASTable",
      }),
      input.config.view("nouvelleTousView", {
        label: "Vue des candidatures digitTous",
        parentTable: "candidaturesASTableDigitTous",
      }),
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
      input.config.field("candidaturesASEmailDigiTous", {
        label: "Champs email des candidatures DigiTous",
        parentTable: "candidaturesASTableDigitTous",
      }),
      input.config.field("candidaturesASFirstnameDigiTous", {
        label: "Champs prénom des candidatures DigiTous",
        parentTable: "candidaturesASTableDigitTous",
      }),
      input.config.field("candidaturesASLastnameDigiTous", {
        label: "Champs nom des candidatures DigiTous",
        parentTable: "candidaturesASTableDigitTous",
      }),
      input.config.field("candidaturesASPhoneDigiTous", {
        label: "Champs téléphone des candidatures DigiTous",
        parentTable: "candidaturesASTableDigitTous",
      }),
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
  for (const j in views) {
    const view = views[j];
    scenarioSearchDuplicates(view, learnersData, learnersRecord)
  };
}

function scenarioSearchDuplicates(view, learnersData, learnersRecord) {
  for (const i in view.data) {
    const applicantData = view.data[i];
    output.markdown("---");

    output.text("Voici le candidat à comparer: ");
    output.table(applicantData);

    // compare apprenant/candidature
    const learnersOK = learnersData.map((apprenant) => {
      // todo: compare each fields and return distance percent
      // todo: passé si la candidature a deja été liée à cet apprenant
      // todo: concatener nom+prenom et choisir le plus petit dans le calcul de distance avec leurs inversion
      const distance = [
        applicantData.lastName && apprenant.lastName
          ? new Levenshtein(applicantData.lastName, apprenant.lastName)
          : { distance: 0 },
        applicantData.firstName && apprenant.firstName
          ? new Levenshtein(applicantData.firstName, apprenant.firstName)
          : { distance: 0 },
        applicantData.email && apprenant.email
          ? new Levenshtein(applicantData.email, apprenant.email)
          : { distance: 0 },
        applicantData.phone && apprenant.phone
          ? new Levenshtein(applicantData.phone, apprenant.phone)
          : { distance: 0 },
      ].reduce((acc, { distance }) => acc + distance, 0);

      const base = [
        applicantData.lastName && apprenant.lastName
          ? applicantData.lastName
          : { length: 0 },
        applicantData.firstName && apprenant.firstName
          ? applicantData.firstName
          : { length: 0 },
        applicantData.phone && apprenant.phone ? applicantData.phone : { length: 0 },
        applicantData.email && apprenant.email ? applicantData.email : { length: 0 },
      ].reduce((acc, { length }) => acc + length, 0);

      const rate = (base - distance) / base;
      const extension =
        rate > 0.8 ? " 🤩" : rate > 0.7 ? " 😎" : rate > 0.6 ? " 🤔" : "";
      output.markdown(
        `\`\`\`${apprenant.id}\`\`\` similaire à : ${
          100 * rate
        } %${extension}`
      );

      // si correspondant à plus de 60%
      return rate > 0.6;
    });

    const learnersDataFiltred = learnersOK
      .map((value, i) => (value ? learnersData[i] : undefined))
      .filter((value) => value);

    if (!learnersDataFiltred || learnersDataFiltred.length < 1) {
      output.text("☑ Aucune similarité pour ce champs");
    } else {
      // todo: afficher le pourcentage de similarité
      output.text("Voici les résultats : ");
      output.table(learnersDataFiltred);
      let response = await input.buttonsAsync(
        "Souhaitez vous lier ce champ ?",
        ["Oui", "Non"]
      );
      if (response === "Oui") {
        const apprenantSourceRecord = await input.recordAsync(
          "Veuillez sélectionner un enregistrement :",
          learnersOK
            .map((value, i) => (value ? learnersRecord[i] : undefined))
            .filter((value) => value)
        );

        output.inspect(view.records[i]);
        output.inspect(apprenantSourceRecord);
        output.text("✅ La candidature a été associée à son apprenant.");
        // todo: si record selectionner l'associer champs "Fiche apprenants"
      } else {
        output.text("☑ On passe au suivant");
      }
    }
  }
}