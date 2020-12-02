import { MailReadSdk } from "../mailReadSdk";

export function buildComposeCard() {
  console.log("buildComposeCard start");

  const homeCard = CardService.newCardBuilder();
  homeCard.setName("Track Email Opens");

  const mainSection = CardService.newCardSection();
  mainSection.addWidget(
    CardService.newTextParagraph().setText(
      "Add tracking to know when this email is opened"
    )
  );

  const json = MailReadSdk.listPixels();
  console.log(json);

  const addTrackAction = CardService.newAction().setFunctionName(
    "onAddTracking"
  );
  mainSection.addWidget(
    CardService.newTextButton()
      .setOnClickAction(addTrackAction)
      .setText("Add Tracker")
  );

  homeCard.addSection(mainSection);

  console.log("buildComposeCard end");

  return homeCard;
}

(global as any).onAddTracking = function () {
  // create a new tracking pixel
  const pixelUrl = MailReadSdk.createPixel();
  console.log(pixelUrl);
  const response = CardService.newUpdateDraftActionResponseBuilder()
    .setUpdateDraftBodyAction(
      CardService.newUpdateDraftBodyAction()
        .setUpdateType(CardService.UpdateDraftBodyType.IN_PLACE_INSERT)
        .addUpdateContent(
          `<img src="${pixelUrl}"></img>`,
          CardService.ContentType.IMMUTABLE_HTML
        )
    )
    .build();

  return response;
};
