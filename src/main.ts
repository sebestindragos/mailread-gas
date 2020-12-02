import { buildComposeCard } from "./compose";
import { buildErrorCard } from "./error";
import { checkAuth } from "./oauth";

(global as any).startContextualApp = (e: any) => {
  console.log("startContextualApp start");
  // display OAuth prompt if user is not logged in
  checkAuth(); // must be outside of try catch

  try {
    return [buildHomeCard().build()];
  } catch (error) {
    console.log("startContextualApp failed");
    return [buildErrorCard(error)];
  }
};

(global as any).startComposeApp = (e: any) => {
  console.log("startComposeApp start");
  // display OAuth prompt if user is not logged in
  checkAuth(); // must be outside of try catch

  try {
    return [buildComposeCard().build()];
  } catch (error) {
    console.log("startComposeApp failed");
    return [buildErrorCard(error)];
  }
};

function buildHomeCard() {
  console.log("buildHomeCard start");

  const homeCard = CardService.newCardBuilder();
  homeCard.setName("MailRead");

  const mainSection = CardService.newCardSection();
  mainSection.addWidget(
    CardService.newTextParagraph().setText("Welcome to MailRead")
  );

  homeCard.addSection(mainSection);

  console.log("buildHomeCard end");

  return homeCard;
}
