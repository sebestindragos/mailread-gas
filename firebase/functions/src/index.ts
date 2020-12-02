import * as functions from "firebase-functions";
import * as firebase from "firebase-admin";

import { loginWithGoogle } from "./login";
import { trackMailOpen } from "./track";

// init firebase admin SDK
firebase.initializeApp();

export const login = functions.https.onRequest(async (request, response) => {
  try {
    functions.logger.info("oauth login using google");
    const result = await loginWithGoogle(request.body.code);
    response.json(result);
  } catch (error) {
    functions.logger.error("login failed", error);
    response.status(500).json({ message: error.message });
  }
});

export const track = functions.https.onRequest(async (request, response) => {
  try {
    const userId = request.query.uid as string;
    const folderId = request.query.fid as string;
    const pixelId = request.query.pid as string;

    const imageBuffer = await trackMailOpen({ userId, folderId, pixelId });

    response.setHeader("Content-Type", "image/png");
    response.setHeader("Content-Length", imageBuffer.length);
    response.send(imageBuffer);
  } catch (error) {
    functions.logger.error("tracking failed failed", error);
    response.status(500).json({ message: error.message });
  }
});
