// store.js
const LOCAL_STORAGE_KEY = "simple-chat-store";

// Load state from localStorage if available
function loadState() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load state from localStorage:", e);
  }
  return {
    isLoading: false,
    isDirty: false,
    url: "http://localhost:11434/api/generate",
    model: "deepseek-r1:8b",
    messages: [],
    prompt: '',
    theme: "light",
    includeThinking: true,
    settingsOpen: false
  };
}

// Save state to localStorage
function saveState(state) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state to localStorage:", e);
  }
}

const store = {
  state: loadState(),
  actions: {
    requestUpdate(state, payload) {
      return { ...state, ...payload };
    },
    toggleTheme(state) {
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
        isDirty: true,
      };
    },
  },
  listeners: new Set(), // Store listeners for state changes
  dispatch(action, payload) {
    if (this.actions[action]) {
      this.state = this.actions[action](this.state, payload); // Update state
      saveState(this.state); // Save to localStorage
      this.notifyListeners(); // Notify all listeners
    } else {
      console.warn(`Action "${action}" not found.`);
    }
  },
  subscribe(listener) {
    this.listeners.add(listener); // Add a listener
    return () => this.listeners.delete(listener); // Return an unsubscribe function
  },
  notifyListeners() {
    for (const listener of this.listeners) {
      listener(); // Call each listener
    }
  },
};

export default store;