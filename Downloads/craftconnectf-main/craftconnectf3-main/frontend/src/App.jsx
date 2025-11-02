import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InsightsPage from "./pages/InsightsPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import VoiceRecordingPage from "./pages/VoiceRecordingPage";
import AnalyzeProductImagePage from "./pages/AnalyzeProductImagePage";
import ArtisanHubPage from "./pages/ArtisanHubPage";
import SmartProductEnhancerPage from "./pages/SmartProductEnhancerPage";
import QuotationResultPage from "./pages/QuotationResultPage";
import WhatsAppSendPage from "./pages/WhatsAppSendPage";
import ShopifyLaunchPage from "./pages/ShopifyLaunchPage";
import BusinessOverviewPage from "./pages/BusinessOverviewPage";
import BusinessSummaryPage from "./pages/BusinessSummaryPage";
import ProductAnalysisPage from "./pages/ProductAnalysisPage";
import FacebookPostPage from "./pages/FacebookPostPage";
import Layout from "./components/Layout";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Layout>
        <Routes>
          {/* Wizard flow */}
          <Route path="/business-overview" element={<BusinessOverviewPage />} />
          <Route path="/business-summary" element={<BusinessSummaryPage />} />
          <Route path="/product-analysis" element={<ProductAnalysisPage />} />

          {/* Posting pages */}
          <Route path="/facebook-post" element={<FacebookPostPage />} />

          {/* Existing routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/whatsapp" element={<WhatsAppPage />} />
          <Route path="/instagram" element={<ComingSoonPage />} />
          <Route path="/website" element={<ComingSoonPage />} />
          <Route path="/voice-recording" element={<VoiceRecordingPage />} />
          <Route path="/analyze-image" element={<AnalyzeProductImagePage />} />
          <Route path="/hub" element={<ArtisanHubPage />} />
          <Route path="/enhancer" element={<SmartProductEnhancerPage />} />
          <Route path="/quotation" element={<QuotationResultPage />} />
          <Route path="/whatsapp-send" element={<WhatsAppSendPage />} />
          <Route path="/shopify-launch" element={<ShopifyLaunchPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
