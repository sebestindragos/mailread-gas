import { getOAuthService } from "./oauth";

const FUNCTIONS_BASE_URL = PropertiesService.getScriptProperties().getProperty(
  "MAIL_READ_FUNCTIONS_BASE_URL"
);

export class MailReadSdk {
  static createPixel() {
    const tokenInfo = this._decodeIdToken();
    if (!tokenInfo) throw { message: "Unauthorized" };
    const userId = tokenInfo.sub;

    const now = new Date();
    const folderId = `${now.getUTCFullYear()}-${now.getUTCMonth()}`;

    const result = this._authenticatedRequest(
      `https://mailread-1f585.firebaseio.com/pixels/${userId}/${folderId}.json`,
      "post",
      {},
      { createdAt: new Date(), uri: "https://foobar.com", views: [] }
    );
    const pixelId = result.name;

    return `${FUNCTIONS_BASE_URL}/track?uid=${encodeURIComponent(
      userId
    )}&fid=${encodeURIComponent(folderId)}&pid=${encodeURIComponent(pixelId)}`;
  }

  static listPixels() {
    const tokenInfo = this._decodeIdToken();
    if (!tokenInfo) throw { message: "Unauthorized" };
    const userId = tokenInfo.sub;

    return this._authenticatedRequest(
      `https://mailread-1f585.firebaseio.com/pixels/${userId}.json`,
      "get"
    );
  }

  private static _decodeIdToken() {
    const service = getOAuthService();
    const maybeAuthorized = service.hasAccess();
    if (!maybeAuthorized) return null;

    const idToken = service.getIdToken();
    const body = idToken.split(".")[1];
    const decoded = Utilities.newBlob(
      Utilities.base64Decode(body)
    ).getDataAsString();
    return JSON.parse(decoded);
  }

  private static _authenticatedRequest(
    url: string,
    method?: GoogleAppsScript.URL_Fetch.HttpMethod,
    headers?: any,
    body?: any
  ) {
    const service = getOAuthService();
    let maybeAuthorized = service.hasAccess();

    if (maybeAuthorized) {
      // Make the UrlFetch request and return the result.
      const idToken = service.getIdToken();
      console.log("using id token for api", idToken);
      headers = headers || {};
      // headers["Authorization"] = `Bearer ${accessToken}`;
      const data = body ? JSON.stringify(body) : "";

      const resp = UrlFetchApp.fetch(`${url}?auth=${idToken}`, {
        headers: headers,
        contentType: "application/json",
        payload: data,
        method: method || "get",
        muteHttpExceptions: true, // Prevents thrown HTTP exceptions.
        escaping: false,
      });

      const code = resp.getResponseCode();
      const content = resp.getContentText("utf-8"); // Success
      if (code >= 200 && code < 300) {
        return JSON.parse(content);
      } else if (code == 401) {
        // Not fully authorized for this action.
        maybeAuthorized = false;
        console.log(`Unauthorized API call ${code} ${content}`);
        throw JSON.parse(resp.getContentText("utf-8"));
      } else {
        // Handle other response codes by logging them and throwing an
        // exception.
        console.error(
          "Backend server error (%s): %s",
          code.toString(),
          resp.getContentText("utf-8")
        );
        throw JSON.parse(resp.getContentText("utf-8"));
      }
    } else {
      // Invoke the authorization flow using the default authorization
      // prompt card.
      CardService.newAuthorizationException()
        .setAuthorizationUrl(service.getAuthorizationUrl())
        .setResourceDisplayName("MailRead account")
        .throwException();
    }
  }
}
