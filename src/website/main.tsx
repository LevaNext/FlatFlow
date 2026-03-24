/**
 * Website entry point. Used only when the app is built/served as a normal website.
 * Do not import extension-only code (e.g. chrome APIs, sidepanel components) here.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../index.css";
import { Toaster } from "@/components/ui/toaster";
import {
  DonationHashRedirect,
  FallbackWithinLocale,
  LegacyDonationRedirect,
  LegacyFaqRedirect,
  LegacyPrivacyRedirect,
  LocaleLayout,
  RootLocaleRedirect,
  UnknownPathRedirect,
} from "./components/LocaleLayout";
import { WebsiteLayout } from "./components/WebsiteLayout";
import { FaqPage } from "./pages/FaqPage";
import { LandingPage } from "./pages/LandingPage";
import { PrivacyPage } from "./pages/PrivacyPage";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
createRoot(root).render(
  <StrictMode>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLocaleRedirect />} />
        <Route path="/faq" element={<LegacyFaqRedirect />} />
        <Route path="/privacy" element={<LegacyPrivacyRedirect />} />
        <Route path="/donation" element={<LegacyDonationRedirect />} />
        <Route path="/:lang" element={<LocaleLayout />}>
          <Route element={<WebsiteLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="donation" element={<DonationHashRedirect />} />
            <Route path="*" element={<FallbackWithinLocale />} />
          </Route>
        </Route>
        <Route path="*" element={<UnknownPathRedirect />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
