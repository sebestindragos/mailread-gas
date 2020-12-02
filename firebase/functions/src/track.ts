import * as firebase from "firebase-admin";
import * as functions from "firebase-functions";

const PNG_IMAGE_CONTENT_BASE64 =
  "R0lGODlhAQABAJAAAP8AAAAAACH5BAUQAAAALAAAAAABAAEAAAICBAEAOw==";
const RESPONSE_BUFFER = Buffer.from(PNG_IMAGE_CONTENT_BASE64, "base64");

export function trackMailOpen({
  userId,
  folderId,
  pixelId,
}: {
  userId?: string;
  folderId?: string;
  pixelId?: string;
}) {
  return new Promise<Buffer>((resolve, reject) => {
    if (!userId || !folderId || !pixelId) {
      return reject({ message: "Missing query params" });
    }
    const ref = firebase
      .database()
      .ref(`/pixels/${userId}/${folderId}/${pixelId}`);

    ref.once(
      "value",
      (snapshot) => {
        const data = snapshot.val();
        functions.logger.info(data);

        // record a new view event
        const viewsRef = firebase
          .database()
          .ref(`/pixels/${userId}/${folderId}/${pixelId}/views`);
        viewsRef
          .push()
          .set({ createdAt: Date.now(), name: "asd" })
          .then(() => {
            functions.logger.info("tracking pixel recorded a new mail read");
            resolve(RESPONSE_BUFFER);
          })
          .catch((pushErr) => reject(pushErr));
      },
      (error) => reject(error)
    );
  });
}
