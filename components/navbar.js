import { html, render } from "lit";
import store from "../services/store.js"; // Import the singleton store

const navbarTemplate = () => html`
  <style>
    progress {
      position: absolute;
      border-radius: 0;
    }
  </style>
  <progress ?hidden=${!store.state.isLoading}></progress>
  <div class="container">
    <nav>
      <ul>
        <li><strong>Simple</strong> <kbd>chat</kbd></li>
      </ul>
      <ul>
        <li>
          <button
            @click=${() =>
              store.dispatch("requestUpdate", {
                ...store.state,
                settingsOpen: true,
              })}
            class="secondary"
          >
            ${settingsIcon}
          </button>
        </li>
        <li>
          <button
            @click=${() => store.dispatch("toggleTheme")}
            class="secondary"
          >
            ${store.state.theme === "dark" ? darkThemeIcon : lightThemeIcon}
          </button>
        </li>
      </ul>
    </nav>
  </div>
  <dialog ?open=${store.state.settingsOpen}>
    <article>
      <h2>Chat settings</h2>
      <p>
        Adjust the URL where your LLM api exists and the requested model to use.
      </p>
      <label>
        URL <input placeholder="http://localhost:11434/api/generate"
        @input=${(e) =>
          store.dispatch("requestUpdate", {
            ...store.state,
            url: e.target.value,
          })}
        .value=${store.state.url} / >
      </label>
      <label>
        Model <input placeholder="deepseek-r1:1.5b"
        @input=${(e) =>
          store.dispatch("requestUpdate", {
            ...store.state,
            model: e.target.value,
          })}
        .value=${store.state.model} / >
      </label>
      <label>
        <input
          type="checkbox"
          role="switch"
          @click=${() =>
            store.dispatch("requestUpdate", {
              ...store.state,
              includeThinking: !store.state.includeThinking,
            })}
          ?checked=${store.state.includeThinking}
        />
        Allow thinking in response
      </label>
      <footer>
        <button
          @click=${() =>
            store.dispatch("requestUpdate", {
              ...store.state,
              settingsOpen: false,
            })}
        >
          Close
        </button>
      </footer>
    </article>
  </dialog>
`;

const renderNavbar = (container) => {
  render(navbarTemplate(), container);
  store.subscribe(() => render(navbarTemplate(), container));
};

export default renderNavbar;

const darkThemeIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  height="20"
  width="14"
  viewBox="0 0 384 512"
>
  <path
    d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"
  />
</svg>`;

const lightThemeIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  height="24"
  width="18"
  viewBox="0 0 512 512"
>
  <path
    d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"
  />
</svg>`;

const settingsIcon = html` <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
  height="24"
  width="18"
>
  <path
    d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"
  />
</svg>`;
