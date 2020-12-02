import * as functions from "firebase-functions";
import axios from "axios";
import { google } from "googleapis";

const FIREBASE_API_KEY = functions.config().mailread.firebase_api_key;
const FIREBASE_AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`;

export async function loginWithGoogle(authCode: string) {
  let oauth2Client = new google.auth.OAuth2(
    functions.config().google.oauth_client_id,
    functions.config().google.oauth_client_secret,
    functions.config().google.oauth_redirect_uri
  );
  const { tokens } = await oauth2Client.getToken(authCode);

  functions.logger.info(
    "using id token to login to firebase!",
    tokens.id_token
  );

  const result = await axios.post(FIREBASE_AUTH_URL, {
    requestUri: functions.config().google.oauth_redirect_uri,
    postBody: `id_token=${tokens.id_token}&providerId=google.com`,
    returnSecureToken: true,
    returnIdpCredential: true,
  });

  return {
    id_token: result.data.idToken,
    refresh_token: result.data.refreshToken,
    expires_in: result.data.expiresIn,
    oauth_id_token: result.data.oauthIdToken,
  };
}
