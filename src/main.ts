import "./style.scss";
import "./partials/styles/global.scss";
import "./partials/styles/btn.scss";
import "./partials/styles/formInputGroup.scss";
import "./partials/styles/formUser.scss";
import "./partials/styles/linkCard.scss";
import "./pages/homePage/style.scss";
import "./pages/login/style.scss";
import "./pages/registration/style.scss";
import "./pages/profile/style.scss";
import "./pages/errorsPage/style.scss";
import "./pages/chat/style.scss";
import "./partials/styles/chatItem.scss";
import "./partials/styles/conversationHeader.scss";
import "./partials/styles/message.scss";
import "./partials/styles/messageInput.scss";
import "../scripts/handlebars-helpers.js";
import "./partials/styles/icon.scss";
import { Router } from "./services/Router";
import { httpClient } from "./services/HttpClient";

const router = new Router();

(window as any).router = router;

(window as any).httpClient = httpClient;

import { webSocketService } from "./services/WebSocketService";
(window as any).webSocketService = webSocketService;

document.addEventListener("DOMContentLoaded", async () => {
  await router.start();
});
