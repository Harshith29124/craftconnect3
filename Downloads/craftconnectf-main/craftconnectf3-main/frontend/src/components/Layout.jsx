import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.pathname !== "/";

  return (
    <header className="sticky top-0 z-20 border-b border-[#f4f2f0] bg-[#FFFCF9]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            aria-label="Back"
            onClick={() => navigate(-1)}
            disabled={!canGoBack}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              canGoBack
                ? "text-[#897261] hover:bg-[#fef3e9]"
                : "text-gray-300 cursor-default"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="size-7 text-[#ec6d13]" aria-hidden>
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.2967 39.7376 5.5013 36.3314 3.8506 32.3462C2.1999 28.361 1.7679 23.9758 2.6095 19.7452C3.451 15.5145 5.5282 11.6284 8.5783 8.5783C11.6284 5.5282 15.5145 3.451 19.7452 2.6095C23.9758 1.768 28.361 2.1999 32.3462 3.8506C36.3314 5.5013 39.738 8.2967 42.134 11.8833C44.531 15.4698 45.81 19.6865 45.81 24L24 24L24 45.8096Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#181411]">
            CraftConnect
          </h1>
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#FFFCF9] text-[#181411]">
      <Header />
      <main className="min-h-[calc(100vh-56px)]">{children}</main>
    </div>
  );
};

export default Layout;
