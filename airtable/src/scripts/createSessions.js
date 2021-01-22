async () => {
  // Envoyer les sessions Airtable vers Crossknowledge
  const config = input.config({
    title: "Configuration de la création de sessions",
    description:
      "Ce script permet de créer de nouvelles sessions dans CrossKnowledge. Les paramètres ci-dessous servent à trouver les informations requises à la bonne exécution du script (Il n'est pas nécessaire d'y toucher).",
    items: [
      input.config.table("sessionTable", {
        label: "Table des sessions",
      }),
      input.config.view("sessionView", {
        label: "Vue des sessions à créer",
        parentTable: "sessionTable",
      }),
      input.config.table("learnerTable", {
        label: "Table des apprenants à lier",
      }),
      input.config.view("learnerView", {
        label: "Vue des apprenants à lier",
        parentTable: "learnerTable",
      }),
      input.config.field("learnerId", {
        label: "Champ identifiant des apprenants",
        parentTable: "learnerTable",
      }),
      input.config.field("learnerEmail", {
        label: "Champ email des apprenants",
        parentTable: "learnerTable",
      }),
      input.config.field("learnerGUID", {
        label: "Champ GUID des apprenants",
        parentTable: "learnerTable",
      }),
      input.config.field("sessionProgram", {
        label: "Champ programme de la session",
        parentTable: "sessionTable",
      }),
      input.config.field("sessionTitle", {
        label: "Champ titre de la session",
        parentTable: "sessionTable",
      }),
      input.config.field("sessionStart", {
        label: "Champ date de début de la session",
        parentTable: "sessionTable",
      }),
      input.config.field("sessionEnd", {
        label: "Champ date de fin de la session",
        parentTable: "sessionTable",
      }),
      input.config.field("sessionWelcomeText", {
        label: "Champs texte de bienvenue de la session",
        parentTable: "sessionTable",
      }),
      input.config.field("sessionLearners", {
        label: "Champs des apprenants de la session",
        parentTable: "sessionTable",
      }),
      input.config.field("sessionFacilitators", {
        label: "Champs des animateurs de la session",
        parentTable: "sessionTable",
      }),
    ],
  });

  try {
    output.markdown("### Création des sessions Crossknowledge");

    // récupération de tous les apprennants créés
    let learnerQuery = await config.learnerView.selectRecordsAsync();

    // récupération des sessions à créer
    let sessionQuery = await config.sessionView.selectRecordsAsync();

    if (sessionQuery.records.length < 1) {
      output.markdown("---");
      output.markdown(
        `🆗 Aucune session à créer dans la vue "${config.sessionView.name}".`
      );
      // @ts-ignore
      return;
    }

    output.markdown("Liste des sessions à créer :");
    output.table(sessionQuery.records);

    // préparation des données à envoyer vers la LAMBDA
    const data = sessionQuery.records.map((sessionRecord) => {
      // récupére les champs guid, id, et email de chaque Apprenants en priorité
      const getLearnerData = (learnerRecord) => {
        // lien entre le champs de la session et détail de l'apprennant
        const learnerCreated = learnerQuery.records.find(
          ({ id }) => learnerRecord.id === id
        );
        if (learnerCreated) {
          const guid = learnerCreated.getCellValue(config.learnerGUID);
          if (guid) {
            return {
              guid,
              id: learnerCreated.getCellValue(config.learnerId),
              email: learnerCreated.getCellValue(config.learnerEmail),
            };
          }
        }
        throw {
          message:
            "L'apprennant n'a pas été retrouvé dans la vue 'Comptes CK créés' ou ne contient pas de GUID.",
          data: learnerRecord,
        };
      };
      const data = {
        program: sessionRecord.getCellValue(config.sessionProgram),
        title: sessionRecord.getCellValue(config.sessionTitle),
        start: sessionRecord.getCellValue(config.sessionStart),
        end: sessionRecord.getCellValue(config.sessionEnd),
        welcomeText: sessionRecord.getCellValue(config.sessionWelcomeText),
        learners: (
          sessionRecord.getCellValue(config.sessionLearners) || []
        ).map(getLearnerData),
        facilitators: (
          sessionRecord.getCellValue(config.sessionFacilitators) || []
        ).map(getLearnerData),
      };

      if (!data.title) {
        throw "Il manque un titre à une session.";
      }
      if (!data.program) {
        throw "Il manque un programme à cette session " + data.title + ".";
      }
      if (!data.start) {
        throw "Il manque une date de début à cette session " + data.title + ".";
      }
      return data;
    });
    output.text("✅ Les sessions ont bien été vérifiées et formatées.");

    // Envoie des sessions de manière séquentielle pour éviter que CK rejette certaines réponses dû à de trop nombreux appels
    for (const i in data) {
      const session = data[i];
      output.markdown(`🆙 Envoie de la session "${session.title}".`);
      const response = await fetch(process.env.LAMBDA_API_URL_SESSIONS, {
        method: "POST",
        body: JSON.stringify({ data: [session] }),
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.LAMBDA_API_KEY,
        },
      });

      const responseData = await response.json();
      if (responseData.ok) {
        // Si la lambda a créé les session
        output.markdown(
          `✅ La session "${session.title}" a été créé dans Crossknowledge.`
        );
        await config.sessionTable.updateRecordsAsync(
          sessionQuery.records.map((record, i) => ({
            id: record.id,
            fields: {
              "Session CK créer": true,
              GUID: responseData.data.guid[i],
            },
          }))
        );
        output.text(
          `✅ La session "${session.title}" à bien été mise à jour dans Airtable.`
        );
      } else {
        // Si une erreur s'est produite durant la création de sessions
        throw responseData; // renvoi de l'erreur vers le catch
      }
    }
    output.markdown("---");
    output.text(`🆗 Toutes les sessions ont bien été créées.`);
  } catch (err) {
    output.markdown("---");
    output.markdown("❌ Une erreur s'est produite lors de l'enregistrement.");
    output.markdown(
      "Veuillez contacter votre administrateur Konexio (📧 [airtable@konexio.eu](mailto:airtable@konexio.eu))."
    );
    throw err; // affichage de l'erreur
  }
};
