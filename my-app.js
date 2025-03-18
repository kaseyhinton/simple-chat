import { html, render } from "lit";

import renderNavbar from "./components/navbar.js";
import store from "./services/store.js";
import renderChat from "./components/chat.js";

export const MyAppTemplate = () => html`
  <div id="navbar"></div>
  <main class="container">
    <div id="chat"></div>
  </main>
`;

const _render = (container) => {
  console.log("Rendering application", store.state);

  document.body.setAttribute("data-theme", store.state.theme);

  render(MyAppTemplate(), container);

  const navbarContainer = document.getElementById("navbar");
  renderNavbar(navbarContainer);

  const chatContainer = document.getElementById("chat");
  renderChat(chatContainer);
};

const renderMyApp = (container) => {
  _render(container);
  store.subscribe(() => _render(container));
};

export default renderMyApp;
