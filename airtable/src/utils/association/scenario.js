const { distanceRatio } = require("./ratioProcessing");
const {
  translateApplicantKeys,
  translateLearnerKeys,
  getRatioExtension,
  ACCEPTATION_RATIO,
} = require("./tools");

// Scenario de la jointure entre candidatures et apprenants
export const scenarioSearchDuplicates = async (
  { data: applicantsData, records: applicantsRecords },
  learnersData,
  learnersRecord
) => {
  for (const i in applicantsData) {
    // todo: passé si la candidature a deja été liée à cet apprenant
    const applicantData = applicantsData[i];
    const applicantsRecord = applicantsRecords[i];

    output.markdown("---");
    output.text(
      `Voici le candidat ${Number(i) + 1}/${applicantsData.length} à comparer: `
    );
    output.table(translateApplicantKeys(applicantData));

    if (applicantData.learner) {
      await input.buttonsAsync("☑ Le candidat possède déjà son apprenant", [
        "Passer",
      ]);
      break;
    }

    // compare apprenant/candidature
    const learnersRatio = learnersData.map((learnerData) =>
      distanceRatio(learnerData, applicantData)
    );

    // filtrage des apprenant respectant la condition et inclusion des données, du record...
    const learnersFiltred = learnersRatio.reduce((acc, ratio, i) => {
      if (ratio >= ACCEPTATION_RATIO) {
        return [
          ...acc,
          { i, ratio, data: learnersData[i], record: learnersRecord[i] },
        ];
      }
      return acc;
    }, []);

    if (learnersFiltred.length < 1) {
      await input.buttonsAsync("☑ Aucune similarité pour ce champs", [
        "Passer",
      ]);
    } else {
      output.text(" 👩🏽‍🎓 Apprenants correspondants trouvés");
      output.table(
        learnersFiltred.map(({ ratio, data }) => ({
          ...translateLearnerKeys(data),
          Correspondance:
            (ratio * 100).toFixed(0) + "%" + getRatioExtension(ratio),
        }))
      );

      // tant qu'aucun champ selectionné, boucler (cela permet de redemander si l'utilisateur souhaite lier le champ au cas ou il quitte la selection sans choisir de champ)
      let selectedLearnerRecord;
      while (!selectedLearnerRecord) {
        let response = await input.buttonsAsync(
          "Souhaitez-vous associer la 🙋‍♂️ candidature avec l'un de ces 👩🏽‍🎓 apprenants",
          ["Oui", "Non"]
        );
        if (response === "Oui") {
          selectedLearnerRecord = await input.recordAsync(
            "Veuillez sélectionner 👩🏽‍🎓 l'apprenant à associer",
            learnersFiltred.map(({ record }) => record)
          );
          if (selectedLearnerRecord) {
            // output.inspect(applicantRecord);
            // output.inspect(selectedLearnerRecord);
            await config.candidaturesASTable.updateRecordAsync(
              applicantsRecord,
              {
                // determiner la vue ( digiAll/Start ou digiTous)
                [config.candidaturesASLearners.id]: [selectedLearnerRecord],
              }
            );
            // todo: si record selectionner l'associer champs "Fiche apprenants"
            output.text(
              "✅ La 🙋‍♂️ candidature a été associée à 👩🏽‍🎓 l'apprenant sélectionné "
            );
            // output.text(
            //   "🛠️ La fonctionnalité d'association de la candidature vers son apprenant est en cours de création."
            // );
          } else {
            output.text("❌ Vous n'avez pas choisi de champ");
          }
        } else {
          output.text("☑ On passe au suivant");
          break; // sortie du while
        }
      }
    }
  }
};
