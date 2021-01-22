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
  addFacilitatorsSession,
} = require("../crossknowledge");
const { ENVIRONMENT_PRODUCTION } = require("../constants");
const {
  makeReturnError,
  makeReturnSuccess,
  makeTrainingError,
  makeTitleError,
  makeStartError,
  makeLearnerGUIDError,
  makeNoLearnerError,
  makeCreateLearnerError,
  makeCreateSessionError,
} = require("../errorManagement");

// Créé des session avec utilisateurs enregistrés dans crossknowledge
exports.createCrossknowledgeSessions = async (event, context) => {
  try {
    const {
      body: { data },
    } = getInfo(event, context);
    console.log(data);

    // Lien avec les GUID Training et verification/Formatage des données
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
      // formatage des apprenants
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

      let facilitatorsFormated = [];
      if (session.facilitators && session.facilitators.length > 0) {
        facilitatorsFormated = session.facilitators.map((learner, j) => {
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
        facilitatorsGUID: facilitatorsFormated,
      };
    });
    console.log("Formatage des données réussie", formatedSessions);

    // Verification de la présence des apprenants dans CK
    await Promise.all(
      Object.values(
        formatedSessions.reduce((acc, { learnersGUID, facilitatorsGUID }) => {
          [...learnersGUID, ...facilitatorsGUID].forEach(
            (guid) => (acc[guid] = guid)
          );
          return acc;
        }, {})
      ).map(async (guid) => {
        console.log("Check if exist : ", guid);
        const res = await getLearner(guid);
        if (!res.success) throw guid;
      })
    ).catch((err) => {
      throw makeReturnError(makeNoLearnerError({ detail: err }));
    });
    console.log("Tous les apprenants existent bien dans crossknowledge");
    console.log("Envoie des données vers CK");

    // à partir d'ici, toutes les données sont conformes et peuvent etre envoyées vers CK
    // Envoie des données vers crossknowledge
    const result = await Promise.all(formatedSessions.map(createWholeSession));

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
    if (process.env.PURPOSE === ENVIRONMENT_PRODUCTION) {
      await notifyError(reason, event, context);
    }
    return makeReturn(reason, STATUS_ERROR);
  }
};

const createWholeSession = async ({
  learnersGUID,
  facilitatorsGUID,
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
    throw makeReturnError(
      makeCreateSessionError({ title, detail: sessionResponse })
    );
  }

  // recuperation du GUID de la session
  const { guid: sessionGUID } = sessionResponse.value[0];

  // lien avec les apprenants
  await Promise.all(
    learnersGUID.map(async (learnerGUID) => {
      console.log("Register : ", learnerGUID);
      const registerResponse = await registerSession(sessionGUID, learnerGUID);
      if (!registerResponse.success) {
        throw makeReturnError(
          makeCreateLearnerError({
            title,
            sessionGUID,
            learnerGUID,
            detail: registerResponse,
          })
        );
      }
    })
  );

  // lien avec les animateurs
  console.log("Register Facilitator : ", facilitatorsGUID);
  const facilitatorResponse = await addFacilitatorsSession(
    sessionGUID,
    facilitatorsGUID
  );
  if (!facilitatorResponse.success) {
    throw makeReturnError({
      code: 222,
      message: "Erreur lors de l'ajout des animateurs.",
      detail: {
        facilitatorsGUID,
        response: facilitatorResponse,
      },
    });
  }
  // todo: add facilitator to session

  return sessionResponse;
};
