exports.makeReturnError = (errorObject) => ({
  ok: false,
  data: errorObject,
});
exports.makeReturnSuccess = (successObject) => ({
  ok: true,
  data: successObject,
});

/**
 * Probleme avec CK lorsque trop de requete, il ne repond plus et renvoie un data undefined
 */
exports.makeTrainingError = ({ title, detail }) => ({
  code: 1,
  message: `Le programme "${title}" n'a pas été retrouvé dans crossknowledge.`,
  detail,
});
exports.makeTitleError = ({ i, detail }) => ({
  code: 2,
  message: `La session numéro "${i}" dans l'ordre d'arrivé n'a pas de titre.`,
  detail,
});
exports.makeStartError = ({ i, detail }) => ({
  code: 3,
  message: `La session numéro "${i}" dans l'ordre d'arrivé n'a pas de date de début.`,
  detail,
});
exports.makeLearnerGUIDError = ({ i, j, detail }) => ({
  code: 4,
  message: `Le GUID de l'utilisateur numéro "${j}" de la session numéro "${i}" n'est pas correct.`,
  detail: detail,
});
exports.makeNoLearnerError = ({ detail }) => ({
  code: 5,
  message: `Certains guid d'apprenants n'existent pas.`,
  detail: detail,
});
exports.makeCreateLearnerError = ({
  title,
  learnerGUID,
  sessionGUID,
  detail,
}) => ({
  code: 6,
  message: `L'enregistrement de l'apprenant ${learnerGUID} à la session "${title}" (${sessionGUID}) a échoué.`,
  detail: detail,
});
exports.makeCreateSessionError = ({ title, detail }) => ({
  code: 7,
  message: `La création de la session "${title}" a échoué.`,
  detail: detail,
});
