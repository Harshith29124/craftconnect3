import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSession, generateRecommendations } from "../services/api";

const InsightsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const sessionId = location.state?.sessionId || JSON.parse(sessionStorage.getItem('craftConnectSession') || '{}').sessionId;

  useEffect(() => {
    const load = async () => {
      if (!sessionId) {
        navigate('/business-overview');
        return;
      }
      try {
        const { data } = await getSession(sessionId);
        setSession(data.session);
      } catch (e) {
        console.error('Failed to load session', e);
      }
    };
    load();
  }, [sessionId, navigate]);

  const handleGenerateRecommendations = async () => {
    try {
      await generateRecommendations(sessionId);
      const { data } = await getSession(sessionId);
      setSession(data.session);
    } catch (e) {
      console.error('Failed to generate recommendations', e);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Loading Insights…</h1>
          <p className="mt-2 text-gray-600">Fetching your analysis and actions.</p>
        </div>
      </div>
    );
  }

  const bs = session.businessSummary || {};
  const pa = session.productAnalysis || {};

  return (
    <div className="min-h-screen w-full bg-[#f8f7f6] text-gray-900">
      <header className="flex items-center justify-between p-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <span className="material-symbols-outlined text-base">auto_awesome</span>
          </div>
          <h2 className="text-lg font-bold">CraftConnect Insights</h2>
        </div>
      </header>

      <div className="my-8 px-4 text-center sm:my-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Your Product Is Ready to Launch</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-gray-600">
          Review the AI-generated insights and publish with one click to WhatsApp, Facebook, or Shopify.
        </p>
      </div>

      <div className="mx-auto mb-6 max-w-5xl rounded-xl border bg-white p-4 sm:p-6 text-sm text-gray-700">
        <div className="flex flex-wrap gap-4">
          <span><strong>Business Type:</strong> {bs.businessType || '—'}</span>
          <span><strong>Location:</strong> {bs.location || '—'}</span>
        </div>
      </div>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-12 md:grid-cols-3">
        <button onClick={() => navigate('/whatsapp-send', { state: { sessionId } })} className="rounded-xl bg-green-600 text-white p-6 text-left shadow hover:bg-green-700">
          <h3 className="text-xl font-bold mb-2">Post to WhatsApp</h3>
          <p>Generate and send a business message based on your analysis.</p>
        </button>

        <button onClick={() => navigate('/facebook-post', { state: { sessionId } })} className="rounded-xl bg-blue-600 text-white p-6 text-left shadow hover:bg-blue-700">
          <h3 className="text-xl font-bold mb-2">Post to Facebook</h3>
          <p>Create a Facebook post with your product details.</p>
        </button>

        <button onClick={() => navigate('/shopify-launch', { state: { sessionId } })} className="rounded-xl bg-black text-white p-6 text-left shadow hover:bg-gray-900">
          <h3 className="text-xl font-bold mb-2">Publish to Shopify</h3>
          <p>Create a Shopify product with images and descriptions.</p>
        </button>
      </main>

      <div className="mx-auto mt-6 max-w-5xl text-center">
        <button onClick={handleGenerateRecommendations} className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
          Generate Final Recommendations
        </button>
      </div>
    </div>
  );
};

export default InsightsPage;
