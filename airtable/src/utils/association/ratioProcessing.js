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
  const applicantNameInversed = (
    (applicantData.lastName || "") + (applicantData.firstName || "")
  ).toLowerCase();
  const applicantName =
    (applicantData.firstName || "") +
    (applicantData.lastName || "").toLowerCase();
  const learnerName =
    (learnerData.firstName || "") + (learnerData.lastName || "").toLowerCase();

  const levenshteinName = new Levenshtein(applicantName, learnerName);
  const levenshteinNameInversed = new Levenshtein(
    applicantNameInversed,
    learnerName
  );

  let distance = 0;
  let base = 0;

  if (levenshteinName.distance < levenshteinNameInversed.distance) {
    distance = levenshteinName.distance;
    base = applicantName.length;
  } else {
    distance = levenshteinNameInversed.distance;
    base = applicantNameInversed.length;
  }

  if (
    applicantData.phone &&
    learnerData.phone &&
    applicantData.phone.length >= 10 &&
    learnerData.phone.length >= 10
  ) {
    distance += new Levenshtein(
      applicantData.phone || "",
      learnerData.phone || ""
    ).distance;
    base += (applicantData.phone || "").length;
  }

  if (applicantData.email && learnerData.email) {
    distance += new Levenshtein(
      applicantData.email || "",
      learnerData.email || ""
    ).distance;
    base += (applicantData.email || "").length;
  }

  return (base - distance) / base;
};
