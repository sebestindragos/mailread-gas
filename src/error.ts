export function buildErrorCard(error: any) {
  console.log("buildErrorCard start");

  const errorCard = CardService.newCardBuilder();
  errorCard.setName("Oops");

  const mainSection = CardService.newCardSection();
  mainSection.addWidget(
    CardService.newTextParagraph().setText(
      "Something went wrong: " + error.message
    )
  );

  errorCard.addSection(mainSection);

  console.log("buildErrorCard end");

  return errorCard.build();
}
