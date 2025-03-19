import { html, render } from "lit";
import store from "../services/store.js"; // Import the singleton store

const unsafeHTML = (message) => {
  if (message.isError) return message.content;
  if (!message.content) return "";
  const node = document.createElement("div");
  const content = parseMarkdown(message.content);
  node.innerHTML = content;
  const parentNode = document.getElementById(message.id);
  if (parentNode) {
    parentNode.replaceChildren(node);
  }
};

/**
 * A simple Markdown parser that converts Markdown syntax to HTML.
 * @param {string} markdown - The Markdown string to parse.
 * @returns {string} - The parsed HTML string.
 */
function parseMarkdown(markdown) {
  if (!store.state.includeThinking) {
    markdown = markdown.replace(/<think>.*?<\/think>/gims, "");
  }

  // Replace code blocks (```)
  markdown = markdown.replace(
    /```(\w+)?\n([\s\S]*?)```/gim,
    (match, language, code) => {
      const langClass = language ? ` class="language-${language}"` : "";
      return `<pre><code${langClass}>${code.trim()}</code></pre>`;
    }
  );

  // Replace inline code
  markdown = markdown.replace(/`(.*?)`/gim, "<code>$1</code>");

  // Replace headers
  markdown = markdown.replace(/^### (.*$)/gim, "<h3>$1</h3>"); // ### Header
  markdown = markdown.replace(/^## (.*$)/gim, "<h2>$1</h2>"); // ## Header
  markdown = markdown.replace(/^# (.*$)/gim, "<h1>$1</h1>"); // # Header

  // Replace bold (** or __)
  markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
  markdown = markdown.replace(/__(.*?)__/gim, "<strong>$1</strong>");

  // Replace italics (* or _)
  markdown = markdown.replace(/\*(.*?)\*/gim, "<em>$1</em>");
  markdown = markdown.replace(/_(.*?)_/gim, "<em>$1</em>");

  // Replace links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');
  // Replace horizontal rules (---)
  markdown = markdown.replace(/^---$/gim, "<hr>");

  // Replace unordered lists (- or *)
  markdown = markdown.replace(/^-\s+(.*$)/gim, "<li>$1</li>");
  markdown = markdown.replace(/^\*\s+(.*$)/gim, "<li>$1</li>");

  // Wrap list items in <ul> tags
  markdown = markdown.replace(/(<li>.*<\/li>(\n|$))/gim, "<ul>\n$1\n</ul>");
  // Replace images
  markdown = markdown.replace(
    /!\[(.*?)\]\((.*?)\)/gim,
    '<img src="$2" alt="$1" />'
  );

  // Replace line breaks
  markdown = markdown.replace(/\n/gim, "<br>");

  return markdown;
}

const chatTemplate = () => html`
  <style>
    .messages-container {
      height: calc(100vh - 165px);
      overflow-y: auto;
    }

    .message {
      padding: 0.5rem;
      border-radius: var(--pico-border-radius);
      display: flex;
      gap: 6px;
    }

    .user-message {
      background-color: var(--primary-focus);
      color: var(--primary-inverse);
    }

    .assistant-message {
      background-color: var(--card-sectionning-background-color);
    }

    form {
      display: grid;
      grid: "input button" / 1fr 150px;
      gap: 1rem;
    }

    .status {
      text-align: center;
      color: var(--muted-color);
      margin: 1rem 0;
    }

    kbd {
      background-color: transparent;
      font-size: 0.75rem;
      padding: 0;
      color: var(--pico-secondary);
      min-width: 90px;
    }

    .is-error {
      background: red;
    }

    span.content {
      font-size: smaller;
    }

    span.content.error {
      color: var(--pico-color-red-400);
    }

    think {
      color: var(--pico-secondary);
      opacity: 0.8;
      padding: 0 1rem 1rem 1rem;
      background-color: var(--pico-code-background-color);
      border-radius: var(--pico-border-radius);
      font-size: small;
      display: block;
    }

    p[thinking] {
      text-align: center;
      margin-top: 1rem;
      color: var(--pico-color-slate-400);
      font-size: 0.75rem;
    }

    @media (max-width: 500px) {
      form {
        grid: inherit;
      }

      .messages-container {
        height: calc(100vh - 220px);
      }
    }
  </style>

  <div class="messages-container">
    ${store.state.messages.map(
      (msg) =>
        html`
          <div class="message ${msg.role}-message">
            <kbd class="primary"
              >${msg.role === "user" ? "me:" : "assistant:"}</kbd
            >
            <span id="${msg.id}" class="content ${msg.isError ? "error" : ""}">
              ${unsafeHTML(msg)}
            </span>
          </div>
        `
    )}
    ${store.state.isLoading ? html`<p thinking>Thinking...</p>` : ""}
  </div>
  <footer>
    <form>
      <input
        type="text"
        .value=${store.state.prompt}
        @input=${(e) =>
          store.dispatch("requestUpdate", {
            ...store.state,
            prompt: e.target.value,
          })}
        placeholder="Type your message..."
        ?disabled=${store.state.isLoading}
      />
      <button
        @click=${handleSubmit}
        type="submit"
        ?disabled=${!store.state.prompt || store.state.isLoading}
      >
        Send
      </button>
    </form>
  </footer>
`;

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!store.state.prompt.trim()) return;

  store.dispatch("requestUpdate", {
    ...store.state,
    isLoading: true,
    messages: [
      ...store.state.messages,
      { role: "user", content: store.state.prompt, id: crypto.randomUUID() },
    ],
  });

  try {
    const response = await fetch(store.state.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: store.state.model,
        prompt: store.state.prompt,
        stream: false,
      }),
    });

    const reader = response.body.getReader();
    let responseText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const parsed = JSON.parse(chunk);
      if (parsed?.error) {
        throw new Error(parsed?.error);
      }
      responseText += parsed.response;
      console.log(responseText);

      store.dispatch("requestUpdate", {
        ...store.state,
        prompt: "",
        messages: [
          ...store.state.messages,
          {
            role: "assistant",
            content: responseText,
            id: crypto.randomUUID(),
          },
        ],
      });
    }
  } catch (error) {
    store.dispatch("requestUpdate", {
      ...store.state,
      messages: [
        ...store.state.messages,
        {
          role: "assistant",
          content:
            error || "Error connecting to Ollama. Make sure it's running!",
          isError: true,
          id: crypto.randomUUID(),
        },
      ],
    });
  }

  store.dispatch("requestUpdate", {
    ...store.state,
    isLoading: false,
  });
};

const renderChat = (container) => {
  render(chatTemplate(), container);
  store.subscribe(() => render(chatTemplate(), container));
};

export default renderChat;
