const Levenshtein = require("levenshtein");

// retourne le couple distance/base de deux jeux de données selon leurs attributs (keys)
const prepareRatio = (
  keys,
  object1,
  object2,
  defaultDistance = 0,
  defaultBase = 0
) =>
  keys.reduce(
    (acc, cur) => ({
      distance:
        acc.distance +
        new Levenshtein(object1[cur] || "", object2[cur] || "").distance,
      base: acc.base + (object1[cur] || "").length,
    }),
    { distance: defaultDistance, base: defaultBase }
  );

// Calcul du ratio entre deux jeu de données
// Ces deux jeux de données possède ces quatre attributs : { firstName, lastName, email, phone }
export const distanceRatio = (learnerData, applicantData) => {
  // traitement de l'inversion
  // concatene nom+prenom et choisi le plus petit dans le calcul de distance avec leurs inversion
  const applicantNameInversed =
    (applicantData.lastName || "") + (applicantData.firstName || "");
  const applicantName =
    (applicantData.firstName || "") + (applicantData.lastName || "");
  const learnerName =
    (learnerData.firstName || "") + (learnerData.lastName || "");

  const levenshteinName = new Levenshtein(applicantName, learnerName);
  const levenshteinNameInversed = new Levenshtein(
    applicantNameInversed,
    learnerName
  );

  const { distance, base } = prepareRatio(
    ["email", "phone"],
    applicantData,
    learnerData,
    levenshteinName.distance < levenshteinNameInversed.distance
      ? levenshteinName.distance
      : levenshteinNameInversed.distance,
    levenshteinName.distance < levenshteinNameInversed.distance
      ? applicantName.length
      : applicantNameInversed.length
  );

  return (base - distance) / base;
};
