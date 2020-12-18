async () => {
  // Envoyer les sessions Airtable vers Crossknowledge
  const config = input.config({
    title: "Configuration de la création de sessions",
    description: "Un scrpit permettant de créer de nouvelles sessions CK.",
    items: [
      input.config.table("sessionTable", {
        label: "La table des sessions",
      }),
      input.config.view("sessionView", {
        label: "La vue des des sessions à créer",
        parentTable: "sessionTable",
      }),
      input.config.table("learnerTable", {
        label: "La table des apprenants à lier",
      }),
      input.config.view("learnerView", {
        label: "La vue des des apprenants à lier",
        parentTable: "learnerTable",
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
      let learners = [];
      const cellLearners = sessionRecord.getCellValue("Apprenants");
      if (cellLearners) {
        // récupére les champs guid, id, et email de chaque Apprenants en priorité
        learners = sessionRecord
          .getCellValue("Apprenants")
          .map((learnerRecord) => {
            // lien entre le champs de la session et détail de l'apprennant
            const learnerCreated = learnerQuery.records.find(
              ({ id }) => learnerRecord.id === id
            );
            if (learnerCreated) {
              const guid = learnerCreated.getCellValue("GUID");
              if (guid) {
                return {
                  guid,
                  id: learnerCreated.getCellValue("Identifiant"),
                  email: learnerCreated.getCellValue("Email"),
                };
              }
            }
            throw {
              message:
                "L'apprennant n'a pas été retrouvé dans la vue 'Comptes CK créés' ou ne contient pas de GUID.",
              data: learnerRecord,
            };
          });
      }
      const data = {
        program: sessionRecord.getCellValue("Programme"),
        title: sessionRecord.getCellValue("Titre"),
        start: sessionRecord.getCellValue("Date de début"),
        end: sessionRecord.getCellValue("Date de fin"),
        welcomeText: sessionRecord.getCellValue("Welcome text"),
        learners,
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
      output.markdown(`🆙 Envoie de la session "${session.title}""`);
      const response = await fetch(config.APIurl, {
        method: "POST",
        body: JSON.stringify({ data: [session] }),
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.APIkey,
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
    output.text(`🆗 Toutes les sessions ont bien été créées`);
  } catch (err) {
    output.markdown("---");
    output.markdown("❌ Une erreur s'est produite lors de l'enregistrement.");
    output.markdown(
      "Veuillez contacter votre administrateur Konexio (📧 [airtable@konexio.eu](mailto:airtable@konexio.eu))."
    );
    throw err; // affichage de l'erreur
  }
};
