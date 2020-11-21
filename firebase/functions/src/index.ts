import * as functions from "firebase-functions";
// import * as firebase from "firebase-admin";

import { loginWithGoogle } from "./login";

export const helloWorld = functions.https.onRequest((_request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

export const login = functions.https.onRequest(async (request, response) => {
  try {
    functions.logger.info("oauth login using google", { structuredData: true });
    const result = await loginWithGoogle(request.body.code);
    response.json(result);
  } catch (error) {
    functions.logger.error("login failed", error);
    response.status(500).json({ message: error.message });
  }
});
