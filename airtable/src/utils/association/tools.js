export const ACCEPTATION_RATIO = 0.5;
export const ACCEPTATION_RATIO_LEVELS = [ACCEPTATION_RATIO, 0.7, 0.8];

export const getRatioExtension = (ratio) =>
  ratio > ACCEPTATION_RATIO_LEVELS[2]
    ? " 🤩"
    : ratio > ACCEPTATION_RATIO_LEVELS[1]
    ? " 😎"
    : ratio > ACCEPTATION_RATIO_LEVELS[0]
    ? " 🤔"
    : "";

export const translateLearnerKeys = ({
  lastName,
  firstName,
  email,
  phone,
}) => ({
  [config.apprenantsLastname.name]: lastName,
  [config.apprenantsFirstname.name]: firstName,
  [config.apprenantsEmail.name]: email,
  [config.apprenantsPhone.name]: phone,
});

export const translateApplicantKeys = ({
  lastName,
  firstName,
  email,
  phone,
  status,
  date,
}) => ({
  [config.candidaturesASLastname.name]: lastName,
  [config.candidaturesASFirstname.name]: firstName,
  [config.candidaturesASEmail.name]: email,
  [config.candidaturesASPhone.name]: phone,
  [config.candidaturesASStatus.name]: status,
  [config.candidaturesASDate.name]: date,
});

// Créé un record dans la table multiple cnadidature ou en trouve un matchant une des candidatures et la met à jour
export const prepareBindApplicants = (multipleInfo) => async (
  applicant1,
  applicant2
) => {
  const multipleLoaded = await loadView(multipleInfo, false);

  // on recherche un record possedant un des deux candidats
  const multiple = await multipleLoaded.values.reduce(
    (acc, { data, record }) =>
      (data.digitAllStart &&
        (data.digitAllStart.some((tu) => tu.id === applicant2.record.id) ||
          data.digitAllStart.some((tu) => tu.id === applicant1.record.id))) ||
      (data.digiTous &&
        (data.digiTous.some((tu) => tu.id === applicant2.record.id) ||
          data.digiTous.some((tu) => tu.id === applicant1.record.id)))
        ? { data, record }
        : acc,
    undefined
  );

  // on met au bon endroit les candidatures
  const newDigitAllStart = [];
  const newDigiTous = [];
  if (applicant1.table === config.candidaturesASTable) {
    newDigitAllStart.push(applicant1.record);
  }
  if (applicant1.table === config.candidaturesASTableDigiTous) {
    newDigiTous.push(applicant1.record);
  }
  if (applicant2.table === config.candidaturesASTable) {
    newDigitAllStart.push(applicant2.record);
  }
  if (applicant2.table === config.candidaturesASTableDigiTous) {
    newDigiTous.push(applicant2.record);
  }

  // il existe un record comprenant au moins un de ces candidats
  if (multiple) {
    function filterUnion(o) {
      return this[o.id] ? false : (this[o.id] = true);
    }
    // on fait l'union entre la donnée existante et la nouvelle (aucun doublon accepté)
    await multipleInfo.table.updateRecordAsync(multiple.record, {
      [multipleInfo.model.digitAllStart.id]: newDigitAllStart
        .concat(multiple.data.digitAllStart || [])
        .filter(filterUnion, {}),
      [multipleInfo.model.digiTous.id]: newDigiTous
        .concat(multiple.data.digiTous || [])
        .filter(filterUnion, {}),
    });
    output.text(
      `☑ Un record de la table ${multipleLoaded.table.name} a été mis à jour`
    );
  } else {
    // on créé cette nouvelle jointure
    await multipleInfo.table.createRecordAsync({
      [multipleInfo.model.digitAllStart.id]: newDigitAllStart,
      [multipleInfo.model.digiTous.id]: newDigiTous,
    });
    output.text(
      `☑ Un nouveau record de la table ${multipleLoaded.table.name} a été créé`
    );
  }
};
