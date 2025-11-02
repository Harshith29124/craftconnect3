import React from "react";

// Simple wrapper for a consistent card shell
export const Card = ({ className = "", children }) => (
  <div className={`bg-white rounded-2xl shadow-xl border border-[#f4f2f0] ${className}`}>{children}</div>
);

// Simple container with consistent max width and padding
export const PageSection = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

// Brand buttons
export const PrimaryButton = ({ className = "", ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-full bg-[#ec6d13] px-6 py-3 font-semibold text-white transition-colors hover:brightness-95 disabled:opacity-50 ${className}`}
  />
);

export const SecondaryButton = ({ className = "", ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-[#181411] border border-[#f4f2f0] hover:bg-gray-50 transition-colors disabled:opacity-50 ${className}`}
  />
);
