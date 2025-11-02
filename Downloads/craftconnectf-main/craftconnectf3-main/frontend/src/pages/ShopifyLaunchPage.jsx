import React, { useState } from "react";
import { PrimaryButton } from "../components/ui";

// Minimal, non-invasive wiring: call session-based endpoints
const ShopifyLaunchPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const publishToShopify = async () => {
    try {
      setLoading(true); setError(""); setResult(null);
      const session = JSON.parse(sessionStorage.getItem("craftConnectSession") || "{}");
      if (!session?.sessionId) throw new Error("Session is missing. Please start from Business Overview.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shopify/publish-from-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to publish");
      setResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Publish to Shopify</h1>
      <div className="bg-white rounded-2xl shadow-xl border border-[#f4f2f0] p-6">
        <p className="text-[#897261] mb-4">Publish your analyzed product directly to your Shopify store using the details generated earlier.</p>
        <PrimaryButton onClick={publishToShopify} disabled={loading}>
          {loading ? "Publishing..." : "Publish Product"}
        </PrimaryButton>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {result?.url && (
          <p className="mt-4">Published: <a href={result.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">View product</a></p>
        )}
      </div>
    </div>
  );
};

export default ShopifyLaunchPage;
