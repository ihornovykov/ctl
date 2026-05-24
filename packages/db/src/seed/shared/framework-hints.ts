export const FRAMEWORK_TASK_TESTING_HINT = `

### How to verify your solution

- Open the **Preview** tab for a live view while you edit \`App.tsx\` or \`App.vue\`.
- Click **Run Tests** in the toolbar to execute Vitest in the sandbox. All tests must pass before **Submit** unlocks.
`;

export const REACT_MAIN_TSX = `import { createRoot } from "react-dom/client";
import App from "./App";

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
`;

export const VUE_MAIN_TS = `import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
`;
