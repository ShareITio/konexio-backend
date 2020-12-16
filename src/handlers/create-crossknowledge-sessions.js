const {
  STATUS_ERROR,
  STATUS_SUCCESS,
  makeReturn,
  getInfo,
} = require("../tools");
const { notifyError } = require("../awsServices");
const {
  createSession,
  registerSession,
  getTrainings,
  getLearner,
} = require("../crossknowledge");

const makeTrainingError = ({ title, detail }) => ({
  code: 1,
  message: `Le programme "${title}" n'a pas été retrouvé dans crossknowledge.`,
  detail,
});
const makeTitleError = ({ i, detail }) => ({
  code: 2,
  message: `La session numéro "${i}" dans l'ordre d'arrivé n'a pas de titre.`,
  detail,
});
const makeStartError = ({ i, detail }) => ({
  code: 3,
  message: `La session numéro "${i}" dans l'ordre d'arrivé n'a pas de date de début.`,
  detail,
});
const makeLearnerGUIDError = ({ i, j, detail }) => ({
  code: 4,
  message: `Le GUID de l'utilisateur numéro "${j}" de la session numéro "${i}" n'est pas correct.`,
  detail: detail,
});
const makeNoLearnerError = ({ detail }) => ({
  code: 5,
  message: `Certains guid d'apprenants n'existent pas.`,
  detail: detail,
});

const makeReturnError = (errorObject) => ({
  ok: false,
  data: errorObject,
});
const makeReturnSuccess = (successObject) => ({
  ok: true,
  data: successObject,
});

// Créé des session avec utilisateurs enregistrés dans crossknowledge
exports.createCrossknowledgeSessions = async (event, context) => {
  try {
    const {
      body: { data },
    } = getInfo(event, context);
    console.log(data);

    // Lien avec les GUID Training et verification des données
    const trainings = await getTrainings();
    console.log(trainings);
    const formatedSessions = data.map((session, i) => {
      console.log("Vérify session", i);
      if (!session.title) {
        throw makeReturnError(makeTitleError({ i, detail: session }));
      }
      if (!session.start) {
        throw makeReturnError(makeStartError({ i, detail: session }));
      }
      const training = trainings.find(({ title }) => session.program === title);
      if (!training) {
        throw makeReturnError(
          makeTrainingError({ title: session.program, detail: session })
        );
      }
      let learnersFormated = [];
      if (session.learners && session.learners.length > 0) {
        learnersFormated = session.learners.map((learner, j) => {
          console.log("Vérify learner", j);
          if (!learner.guid) {
            throw makeReturnError(
              makeLearnerGUIDError({ i, j, detail: learner })
            );
          }
          return learner.guid;
        });
      }

      return {
        title: session.title,
        start: session.start,
        end: session.end,
        welcomeText: session.welcomeText,
        trainingGUID: training.guid,
        learnersGUID: learnersFormated,
      };
    });
    console.log("Formatage des données réussie", formatedSessions);

    // Verification de la présence des apprenants dans CK
    await Promise.all(
      Object.values(
        formatedSessions.reduce((acc, cur) => {
          cur.learnersGUID.forEach((guid) => {
            acc[guid] = guid;
          });
          return acc;
        }, {})
        // TODO avoir chacun des guid apprennant de toutes les sessions (en une seule fois)
      ).map((learnersGUID) => {
        return learnersGUID.map(async (guid) => {
          console.log("Check if exist : ", guid);
          const res = await getLearner(guid);
          if (!res.success) throw guid;
        });
      })
    ).catch((err) => {
      throw makeReturnError(makeNoLearnerError({ detail: err }));
    });
    console.log("Tous les apprenants existent bien dans crossknowledge");
    console.log("Envoie des données vers CK");

    // Envoie des données vers crossknowledge
    const result = await Promise.all(
      formatedSessions.map(
        async ({
          learnersGUID,
          title,
          start,
          end,
          welcomeText,
          trainingGUID,
        }) => {
          console.log("Send : ", title);
          const sessionResponse = await createSession({
            title,
            start,
            end,
            welcomeText,
            trainingGUID,
          });
          if (!sessionResponse.success) {
            throw makeReturnError(sessionResponse);
          }
          const { guid: sessionGUID } = sessionResponse.value[0];
          await Promise.all(
            learnersGUID.map(async ({ guid: learnerGUID }) => {
              console.log("Register : ", learnerGUID);
              const registerResponse = await registerSession(
                sessionGUID,
                learnerGUID
              );
              if (!registerResponse.success) {
                throw makeReturnError(registerResponse);
              }
            })
          );
          return sessionResponse;
        }
      )
    );

    console.log(result);
    return makeReturn(
      makeReturnSuccess({
        message: `Added ${result.length}`,
        guid: result.map(({ value }) => value[0].guid),
      }),
      STATUS_SUCCESS
    );
  } catch (reason) {
    console.error(reason);
    await notifyError(reason, event, context);
    return makeReturn(reason, STATUS_ERROR);
  }
};
