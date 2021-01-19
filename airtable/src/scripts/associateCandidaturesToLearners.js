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
        label: "Table des candidatures digit...",
      }),
      input.config.view("nouvelleAllView", {
        label: "Vue des candidatures digitAll",
        parentTable: "candidaturesASTable",
      }),
      input.config.view("nouvelleStartView", {
        label: "Vue des candidatures digitStart",
        parentTable: "candidaturesASTable",
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
    ],
  });

  output.markdown("### Association candidatures apprenants");

  // initialisation

  // recuperation nouvelle digitall
  const {
    records: recordsAll,
  } = await config.nouvelleAllView.selectRecordsAsync();
  const dataNouvelleAll = recordsAll.map((record) => ({
    lastName: record.getCellValue(config.candidaturesASLastname),
    firstName: record.getCellValue(config.candidaturesASFirstname),
    email: record.getCellValue(config.candidaturesASEmail),
    phone: record.getCellValue(config.candidaturesASPhone),
  }));
  output.markdown("✅ Vue des nouvelles candidatures DigitAll chargée.");

  // recuperation apprenants
  const {
    records: recordsApprenants,
  } = await config.apprenantsView.selectRecordsAsync();
  const dataApprenants = recordsApprenants.map((record) => ({
    id: record.id,
    lastName: record.getCellValue(config.apprenantsLastname),
    firstName: record.getCellValue(config.apprenantsFirstname),
    email: record.getCellValue(config.apprenantsEmail),
    phone: record.getCellValue(config.apprenantsPhone),
  }));
  output.markdown("✅ Vue des nouvelles apprenants chargée.");

  const views = [{ records: recordsAll, data: dataNouvelleAll }];
  for (const j in views) {
    const view = views[j];

    for (const i in view.data) {
      const candidat = view.data[i];
      output.markdown("---");

      output.text("Voici le candidat à comparer: ");
      output.table(candidat);

      // compare apprenant/candidature
      const apprenantResult = dataApprenants.map((apprenant) => {
        // todo: compare each fields and return distance percent
        // passé si la candidature a deja été liée à cet apprenant
        const distance = [
          candidat.lastName && apprenant.lastName
            ? new Levenshtein(candidat.lastName, apprenant.lastName)
            : { distance: 0 },
          candidat.firstName && apprenant.firstName
            ? new Levenshtein(candidat.firstName, apprenant.firstName)
            : { distance: 0 },
          candidat.email && apprenant.email
            ? new Levenshtein(candidat.email, apprenant.email)
            : { distance: 0 },
          candidat.phone && apprenant.phone
            ? new Levenshtein(candidat.phone, apprenant.phone)
            : { distance: 0 },
        ].reduce((acc, { distance }) => acc + distance, 0);

        const base = [
          candidat.lastName && apprenant.lastName
            ? candidat.lastName
            : { length: 0 },
          candidat.firstName && apprenant.firstName
            ? candidat.firstName
            : { length: 0 },
          candidat.phone && apprenant.phone ? candidat.phone : { length: 0 },
          candidat.email && apprenant.email ? candidat.email : { length: 0 },
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
        return rate > 0.625;
      });

      const apprenantResultFilterd = apprenantResult
        .map((value, i) => (value ? dataApprenants[i] : undefined))
        .filter((value) => value);

      if (!apprenantResultFilterd || apprenantResultFilterd.length < 1) {
        output.text("Aucune similarité pour ce champs");
      } else {
        output.text("Voici les résultats : ");
        output.table(apprenantResultFilterd);
        let catOrDog = await input.buttonsAsync(
          "Souhaitez vous lier ce champ ?",
          ["Oui", "Non"]
        );
        if (catOrDog === "Oui") {
          const apprenantSourceRecord = await input.recordAsync(
            "Veuillez sélectionner un enregistrement :",
            apprenantResult
              .map((value, i) => (value ? recordsApprenants[i] : undefined))
              .filter((value) => value)
          );

          output.inspect(view.records[i]);
          output.inspect(apprenantSourceRecord);
          output.text("✅ La candidature a été associée à son apprenant.");
          // todo si record selectionner l'associer champs "Fiche apprenants"
        } else {
          output.text("☑ On passe au suivant");
        }
      }
    }
  }
};
