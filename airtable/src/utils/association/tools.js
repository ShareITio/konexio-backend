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
  id,
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
  id,
}) => ({
  [config.candidaturesASLastname.name]: lastName,
  [config.candidaturesASFirstname.name]: firstName,
  [config.candidaturesASEmail.name]: email,
  [config.candidaturesASPhone.name]: phone,
});
