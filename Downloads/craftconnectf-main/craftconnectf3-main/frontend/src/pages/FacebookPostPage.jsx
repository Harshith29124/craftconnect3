import React, { useState } from "react";
import { PrimaryButton, SecondaryButton } from "../components/ui";

const FacebookPostPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const postPhoto = async () => {
    try {
      setLoading(true); setError(""); setResult(null);
      const session = JSON.parse(sessionStorage.getItem("craftConnectSession") || "{}");
      if (!session?.sessionId) throw new Error("Session is missing. Please start from Business Overview.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/facebook/post-photo-from-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to post to Facebook");
      setResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const postText = async () => {
    try {
      setLoading(true); setError(""); setResult(null);
      const session = JSON.parse(sessionStorage.getItem("craftConnectSession") || "{}");
      if (!session?.sessionId) throw new Error("Session is missing. Please start from Business Overview.");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/facebook/post-text-from-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.sessionId })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to post to Facebook");
      setResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Post to Facebook</h1>
      <div className="bg-white rounded-2xl shadow-xl border border-[#f4f2f0] p-6">
        <p className="text-[#897261] mb-4">Create a Facebook post using your analyzed caption and first product image. One click, automatic content.</p>
        <div className="flex items-center gap-3">
          <PrimaryButton onClick={postPhoto} disabled={loading}>{loading ? "Posting..." : "Post Photo + Caption"}</PrimaryButton>
          <SecondaryButton onClick={postText} disabled={loading}>Post Text Only</SecondaryButton>
        </div>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {result && (
          <div className="mt-4 text-[#181411]">
            <p className="mb-1">Success! Your post has been created.</p>
            {result.postId && <p className="text-sm text-[#897261]">Post ID: {result.postId}</p>}
            {result.photoId && <p className="text-sm text-[#897261]">Photo ID: {result.photoId}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookPostPage;
