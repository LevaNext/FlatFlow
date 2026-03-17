/**
 * Website entry point. Used only when the app is built/served as a normal website.
 * Do not import extension-only code (e.g. chrome APIs, sidepanel components) here.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../index.css";
import { Toaster } from "@/components/ui/toaster";
import { WebsiteLayout } from "./components/WebsiteLayout";
import { LandingProvider } from "./context/LandingContext";
import { DonationPage } from "./pages/DonationPage";
import { FaqPage } from "./pages/FaqPage";
import { LandingPage } from "./pages/LandingPage";
import { PrivacyPage } from "./pages/PrivacyPage";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
createRoot(root).render(
  <StrictMode>
    <LandingProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route element={<WebsiteLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="donation" element={<DonationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LandingProvider>
  </StrictMode>,
);
