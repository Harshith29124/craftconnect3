import React from "react";
import { useNavigate } from "react-router-dom";

const ComingSoonPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] text-[#181411]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#f4f2f0] bg-[#FFFCF9]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="size-6 text-[#ec6d13]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.2967 39.7376 5.5013 36.3314 3.8506 32.3462C2.1999 28.361 1.7679 23.9758 2.6095 19.7452C3.451 15.5145 5.5282 11.6284 8.5783 8.5783C11.6284 5.5282 15.5145 3.451 19.7452 2.6095C23.9758 1.768 28.361 2.1999 32.3462 3.8506C36.3314 5.5013 39.738 8.2967 42.134 11.8833C44.531 15.4698 45.81 19.6865 45.81 24L24 24L24 45.8096Z" fill="currentColor"/></svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight">CraftConnect</h1>
          </div>
          <button onClick={() => navigate(-1)} className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-[#897261] hover:bg-[#fef3e9]">Back</button>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fef3e9] px-3 py-1 text-sm font-semibold text-[#ec6d13]">Coming soon</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">This feature is in progress</h2>
          <p className="mx-auto mt-3 max-w-xl text-[#897261] sm:text-lg">We’re crafting the best experience for artisans. Check back shortly, or explore the live features below.</p>
        </div>

        {/* Actions */}
        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <button onClick={() => navigate('/')} className="h-12 rounded-lg bg-[#ec6d13] px-5 font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]">Go to Home</button>
          <button onClick={() => navigate('/insights')} className="h-12 rounded-lg border border-[#f4f2f0] bg-white px-5 font-semibold text-[#181411] hover:bg-gray-50">View Insights</button>
        </div>

        {/* Illustration line */}
        <div className="mt-16 w-full">
          <div className="h-24 w-full rounded-xl border border-[#f4f2f0] bg-white/70" style={{backgroundImage:"url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3e%3cpath fill=%27none%27 stroke=%27%23fef3e9%27 stroke-width=%271%27 d=%27M10 90 C 20 100, 40 100, 50 90 S 70 80, 80 90%27/%3e%3c/svg%3e')"}}></div>
        </div>
      </main>
    </div>
  );
};

export default ComingSoonPage;
