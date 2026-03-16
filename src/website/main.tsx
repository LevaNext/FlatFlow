/**
 * Website entry point. Used only when the app is built/served as a normal website.
 * Do not import extension-only code (e.g. chrome APIs, sidepanel components) here.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import { LandingPage } from "./pages/LandingPage";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
createRoot(root).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
);
