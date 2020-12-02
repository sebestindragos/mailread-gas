/**
 * Get an OAuth service instance.
 */
export function getOAuthService() {
  const clientId = PropertiesService.getScriptProperties().getProperty(
    "OAUTH_CLIENT_ID"
  );
  const clientSecret = PropertiesService.getScriptProperties().getProperty(
    "OAUTH_CLIENT_SECRET"
  );
  const scope = PropertiesService.getScriptProperties().getProperty(
    "OAUTH_SCOPE"
  );
  const tokenUri = PropertiesService.getScriptProperties().getProperty(
    "OAUTH_TOKEN_URI"
  );
  const firebaseApiKey = PropertiesService.getScriptProperties().getProperty(
    "FIREBASE_API_KEY"
  );
  return OAuth2.createService("MailRead")
    .setAuthorizationBaseUrl("https://accounts.google.com/o/oauth2/v2/auth")
    .setTokenUrl(tokenUri)
    .setRefreshUrl(
      `https://securetoken.googleapis.com/v1/token?key=${firebaseApiKey}`
    )
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .setScope(scope)
    .setCallbackFunction("oauthCallback")
    .setCache(CacheService.getUserCache())
    .setPropertyStore(PropertiesService.getUserProperties());
}

/**
 * Callback method for OAuth flow.
 */
(global as any).oauthCallback = function oauthCallback(callbackRequest: any) {
  console.log("got oauth response", callbackRequest);
  const authorized = getOAuthService().handleCallback(callbackRequest);
  if (authorized) {
    console.log("authorized", authorized);
    // check if the
    return HtmlService.createHtmlOutput(
      "Success! <script>setTimeout(function() { top.window.close() }, 1);</script>"
    );
  } else {
    return HtmlService.createHtmlOutput("Denied");
  }
};

/**
 * Check if the user is logged in and show the default
 * OAuth screen if not.
 */
export function checkAuth() {
  const service = getOAuthService();
  const maybeAuthorized = service.hasAccess();

  // A token is present, but it may be expired or invalid. Make a
  // request and check the response code to be sure.

  // todo https://developers.google.com/gsuite/add-ons/how-tos/non-google-services

  if (!maybeAuthorized) {
    // Invoke the authorization flow using the default authorization
    // prompt card.
    CardService.newAuthorizationException()
      .setAuthorizationUrl(service.getAuthorizationUrl())
      .setResourceDisplayName("MailRead account")
      // .setCustomUiCallback("onBuildOAuthCard")
      .throwException();
  }

  return service;
}

/**
 * Unauthorizes the non-Google service. This is useful for OAuth
 * development/testing.  Run this method (Run > resetOAuth in the script
 * editor) to reset OAuth to re-prompt the user for OAuth.
 */
export function resetOAuth() {
  getOAuthService().reset();
}

/**
 * Logout of the current account.
 * Useful for testing. Add this block to universalActions and publish to invoke this fn
    {
      "label": "Logout",
      "runFunction": "onLogout"
    }
 */
(global as any).onLogout = function (e: any) {
  resetOAuth();
  checkAuth();
};
