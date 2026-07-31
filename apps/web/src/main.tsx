import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { registerServiceWorker } from "./lib/pwa.ts";
import "./styles/theme.css";

const container = document.getElementById("app");
if (!container) throw new Error("No se encontró el elemento #app.");

registerServiceWorker();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
