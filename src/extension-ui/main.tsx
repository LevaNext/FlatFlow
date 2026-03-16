/**
 * Extension UI entry point. Used only when the app is loaded as a Chrome Extension
 * (side panel, popup, etc.). Imports sidepanel and extension-only code.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import SidePanel from "../sidepanel/SidePanel";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
createRoot(root).render(
  <StrictMode>
    <SidePanel />
  </StrictMode>,
);
