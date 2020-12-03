import * as firebase from "firebase-admin";
import * as functions from "firebase-functions";
import { IncomingHttpHeaders } from "http";
import { IPixel } from "./types";

const PNG_IMAGE_CONTENT_BASE64 =
  "R0lGODlhAQABAJAAAP8AAAAAACH5BAUQAAAALAAAAAABAAEAAAICBAEAOw==";
const RESPONSE_BUFFER = Buffer.from(PNG_IMAGE_CONTENT_BASE64, "base64");

const CONTENT_HEADERS = {
  "Content-Type": "image/png",
  "Content-Length": RESPONSE_BUFFER.length,
};

const NO_CACHE_HEADERS = {
  "Pragma-Directive": "no-cache",
  "Cache-Directive": "no-cache",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function trackMailOpen({
  userId,
  folderId,
  pixelId,
  headers,
}: {
  userId?: string;
  folderId?: string;
  pixelId?: string;
  headers: IncomingHttpHeaders;
}): Promise<{
  headers: { [key: string]: string | number };
  imageBuffer: Buffer;
}> {
  functions.logger.info("recording a new email view");
  if (!userId || !folderId || !pixelId) {
    throw { message: "Missing query params" };
  }

  const pixel = await getPixel({ userId, folderId, pixelId });

  let responseHeaders = CONTENT_HEADERS;
  if (!pixel.views) {
    // this is the initial fetch by gmail proxy before sending the email
    // make sure gmail caches the image by not responding with the no-cache headers
    functions.logger.info("got first view from sender");
  } else {
    responseHeaders = { ...CONTENT_HEADERS, ...NO_CACHE_HEADERS };
  }

  // figure out where the view came from
  const userAgentHeaderName = Object.keys(headers)
    .map((headerName) => headerName.toLowerCase())
    .find((headerName) => headerName === "user-agent");
  const userAgentRaw = userAgentHeaderName
    ? (headers[userAgentHeaderName] as string)
    : "";
  const userAgent = getUserAgentFriendlyName(userAgentRaw);
  functions.logger.info("viewed by user agent", userAgent);

  // track a new user open
  await registerPixelView({ userId, folderId, pixelId, userAgent });

  functions.logger.info("tracking pixel recorded a new mail read");

  return {
    headers: responseHeaders,
    imageBuffer: RESPONSE_BUFFER,
  };
}

/**
 * Fetch a pixel from the DB.
 */
function getPixel({
  userId,
  folderId,
  pixelId,
}: {
  userId: string;
  folderId: string;
  pixelId: string;
}) {
  return new Promise<IPixel>((resolve, reject) => {
    const ref = firebase
      .database()
      .ref(`/pixels/${userId}/${folderId}/${pixelId}`);

    ref.once(
      "value",
      (snapshot) => {
        const data = snapshot.val();
        resolve(data);
      },
      (error) => reject(error)
    );
  });
}

/**
 * Register a new view for a pixel.
 */
function registerPixelView({
  userId,
  folderId,
  pixelId,
  userAgent,
}: {
  userId: string;
  folderId: string;
  pixelId: string;
  userAgent: string;
}) {
  return new Promise<void>((resolve, reject) => {
    const viewsRef = firebase
      .database()
      .ref(`/pixels/${userId}/${folderId}/${pixelId}/views`);

    viewsRef
      .push()
      .set({ createdAt: Date.now(), userAgent })
      .then(() => resolve())
      .catch((pushErr) => reject(pushErr));
  });
}

/**
 * Map a user agent to a friendly name.
 */
function getUserAgentFriendlyName(userAgent: string) {
  if (userAgent.includes("GoogleImageProxy")) return "GMail";

  return "unkown";
}
