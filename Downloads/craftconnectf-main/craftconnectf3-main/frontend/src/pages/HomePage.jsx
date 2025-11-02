import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Clear any existing session and start fresh
    sessionStorage.removeItem('craftConnectSession');
    navigate('/business-overview');
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-[#FFFCF9]">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#f4f2f0] px-4 sm:px-10 py-3">
          <div className="flex items-center gap-4 text-[#181411]">
            <div className="size-6 text-[#ec6d13]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
              </svg>
            </div>
            <h1 className="text-[#181411] text-xl font-bold leading-tight tracking-[-0.015em]">CraftConnect</h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#fef3e9] text-[#181411] transition-colors hover:bg-orange-100">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
              </svg>
            </button>
            <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <div className="w-full max-w-4xl">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold tracking-tight text-[#181411] sm:text-6xl mb-6">
                Transform Your Craft into a
                <span className="text-[#ec6d13]"> Thriving Business</span>
              </h1>
              <p className="text-xl leading-8 text-[#897261] max-w-3xl mx-auto mb-8">
                Our AI-powered platform analyzes your craft business, creates compelling product descriptions, and helps you reach customers through Facebook and Shopify - all in minutes.
              </p>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-[#ec6d13] rounded-full hover:bg-[#d8620f] focus:outline-none focus:ring-4 focus:ring-[#ec6d13]/50 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path>
                </svg>
                Start Your Journey
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#f4f2f0]">
                <div className="w-12 h-12 bg-[#fef3e9] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#181411] mb-2">Voice Analysis</h3>
                <p className="text-[#897261]">Tell us about your business and products. Our AI understands your craft and creates detailed insights.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#f4f2f0]">
                <div className="w-12 h-12 bg-[#fef3e9] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM40,54H216a2,2,0,0,1,2,2V98H38V56A2,2,0,0,1,40,54ZM216,202H40a2,2,0,0,1-2-2V110H218v90A2,2,0,0,1,216,202Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#181411] mb-2">Smart Marketing</h3>
                <p className="text-[#897261]">Generate compelling product descriptions and marketing content optimized for your target audience.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#f4f2f0]">
                <div className="w-12 h-12 bg-[#fef3e9] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M229.5,113,163.83,47.28a16,16,0,0,0-22.63,0L116.37,72.11,91.06,46.8A16,16,0,0,0,68.43,69.43L93.74,94.74,47.28,141.21a16,16,0,0,0,0,22.62L113,229.5a16,16,0,0,0,22.63,0l46.46-46.46,25.32,25.31a16,16,0,0,0,22.63-22.63L204.72,160.4,229.5,135.62A16,16,0,0,0,229.5,113Z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#181411] mb-2">One-Click Publishing</h3>
                <p className="text-[#897261]">Instantly publish to Facebook and Shopify with AI-generated content and product listings.</p>
              </div>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#f4f2f0]">
              <h2 className="text-3xl font-bold text-[#181411] mb-8">How It Works</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#ec6d13] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h3 className="font-semibold text-[#181411] mb-2">Describe Your Business</h3>
                  <p className="text-sm text-[#897261]">Record a voice message about your craft business and goals</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#ec6d13] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h3 className="font-semibold text-[#181411] mb-2">Show Your Products</h3>
                  <p className="text-sm text-[#897261]">Upload photos and describe your handmade products</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#ec6d13] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h3 className="font-semibold text-[#181411] mb-2">AI Analysis</h3>
                  <p className="text-sm text-[#897261]">Our AI creates marketing insights and content strategies</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#ec6d13] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                  <h3 className="font-semibold text-[#181411] mb-2">Launch & Sell</h3>
                  <p className="text-sm text-[#897261]">Publish to Facebook and Shopify with one click</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-12">
              <p className="text-lg text-[#897261] mb-6">
                Ready to transform your craft into a thriving online business?
              </p>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-[#ec6d13] rounded-full hover:bg-[#d8620f] focus:outline-none focus:ring-4 focus:ring-[#ec6d13]/50 transition-colors shadow-lg"
              >
                Get Started - It's Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;