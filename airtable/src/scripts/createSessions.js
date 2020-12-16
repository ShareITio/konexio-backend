// Envoyer les sessions Airtable vers Crossknowledge
async () => {
  // Envoyer les sessions Airtable vers Crossknowledge
  try {
    output.text("Création des sessions...");

    // récupération des sessions à créer
    let table = base.getTable("Sessions CK");
    let view = table.getView("Sessions CK à créer");
    let query = await view.selectRecordsAsync();

    // récupération de tous les apprennants créés
    let learnerTable = base.getTable("Comptes CK");
    let learnerView = learnerTable.getView("Comptes CK créés");
    let learnerQuery = await learnerView.selectRecordsAsync();

    output.text("Sessions récupérées:");
    output.table(query.records);

    // préparation des données à envoyer vers la LAMBDA
    const data = query.records.map((sessionRecord) => {
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
        throw "Il manque un titre à une session";
      }
      if (!data.program) {
        throw "il manque un programme à cette session " + data.title;
      }
      if (!data.start) {
        throw "Il manque une date de début à cette session " + data.title;
      }
      return data;
    });
    output.text("Sessions formatées :");
    output.inspect(data);
    // Appel sequentiel pour eviter que CK ne bloque nos trop nombreuses requetes
    for (const i in data) {
      const session = data[i];
      output.markdown(`Envoie de la session : ${session.title}`);
      const response = await fetch(process.env.LAMBDA_API_URL, {
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
        output.text("Les sessions ont bien été enregistrés !");
        console.log(`Réponse de AWS LAMDA`, responseData);
        output.text("Passage des sessions de à créer vers créées...");

        await table.updateRecordsAsync(
          query.records.map((record, i) => ({
            id: record.id,
            fields: {
              "Session CK créer": true,
              GUID: responseData.data.guid[i],
            },
          }))
        );

        output.text(`La session à bien été créée.\nFélicitation !`);
      } else {
        // Si une erreur s'est produite durant la création de sessions
        throw responseData; // renvoi de l'erreur vers le catch
      }
    }
  } catch (err) {
    output.markdown("---");
    output.markdown("❌ Une erreur s'est produite lors de l'enregistrement.");
    output.markdown(
      "Veuillez contacter votre administrateur Konexio (📧 [airtable@konexio.eu](mailto:airtable@konexio.eu))."
    );
    throw err; // affichage de l'erreur
  }
};
