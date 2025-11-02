import React from "react";
import EnhancerSlider from "../components/EnhancerSlider";

const SmartProductEnhancerPage = () => {
  const originalUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA1waSSomWEVOwpxAs0qqfNwD44WPLhYdDsoDk_3oXC9ooayu0OnwI51WoGQWhmMLXIMIcbeKPsYqK224d3L7LaDJPK_bIkcPreWGyiDpi891oFNgG171Mlhd_1aafiGaNEbRRPneaKfIcJeXjS7iozc9LQGWc7Zml6enPnOiyGAybTMFw7i5FzE8uo-1U_BY0QuoaDIGjflnt_yiGBqR0MgGWxiAAECR0jC9jWfn1v8IDzXfHcRgmb8rxnq6VwsnOsXCzPX5TsZME";
  const enhancedUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuB8JmPRAtBs59CHIiMrX5ZmIpHuL2Anmyk48mTO_ECuf-f7oKrdOJ5AhjzE7YR1PL3YPzZkUN_RNhydIk5B5LOaNb3SQUB0u5GzH3ckebCJJ51Nvx07A7uUKFYSwysDOeBNtoB_LkIO9AePdeyeba-itMBA3MdlOH0EYGmnqtF9AqUdmz7IDbMJYlxABj4YKtWARnWcJdyKe7_cFVMsUEg46vmgsUUC2LCTR6YHLZkKFuSIx7_Y6AZ4Fgm9884YozwP4_FdzY9QRN0";

  const handleDownload = () => console.log("Download enhanced image");
  const handleUseForQuotation = () => console.log("Use for quotation");
  const handlePostToInstagram = () => console.log("Post to Instagram");

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f8f7f6] dark:bg-[#221810]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#f4f2f0] dark:border-[#221810]/50 px-4 sm:px-10 py-3">
        <div className="flex items-center gap-4 text-[#333333] dark:text-[#f8f7f6]">
          <div className="size-6 text-[#ec6d13]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/></svg>
          </div>
          <h2 className="text-lg font-bold tracking-[-0.015em]">Craft Connect</h2>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-9 text-[#897261] dark:text-[#a39e99]">
            <a className="text-sm">Dashboard</a>
            <a className="text-sm">My Products</a>
            <a className="relative text-sm font-bold text-[#ec6d13] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-[#ec6d13]">Enhancer</a>
            <a className="text-sm">Help</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-lg bg-[#f4f2f0] dark:bg-[#221810]/60 text-[#333333] dark:text-[#f8f7f6] flex items-center justify-center"><span className="material-symbols-outlined !text-xl">notifications</span></button>
            <div className="size-10 rounded-full bg-cover bg-center" style={{backgroundImage:"url('https://lh3.googleusercontent.com/aida-public/AB6AXuCitLj7JdbfonvYjGkk_QnRXQYZdw2WRwTBN4Muj67hts1ofdAgr0zx2xYQf5fgh_5YyYEGQH7E83mF-fTs7MV1rO4lmLmQnzxG1tiiraf6JGYIJk2NXKWXM8SunfVDy-hfb8y2Ze2YZ3vZrbdlBDZYcxSlleq-tSXMlmIpMJIZQ8Z3t9ilXGKb0s5zliMLr-bg0m8H9gs_pXDmRWPtxjHFszWjalw4ApX4vssbpEipT2gEJpu4i2qHZIDl67TgBr_t5637LFYXm8I')"}} />
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col items-center gap-8">
          <div className="text-center w-full max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.033em] text-[#333333] dark:text-[#f8f7f6]">Smart Product Enhancer</h1>
            <p className="mt-2 text-[#897261] dark:text-[#a39e99]">Review your AI-enhanced image below. Drag the slider to compare.</p>
          </div>

          <EnhancerSlider originalUrl={originalUrl} enhancedUrl={enhancedUrl} />

          <div className="w-full max-w-2xl pt-4 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
            <button onClick={handleDownload} className="h-12 w-full sm:w-auto px-5 rounded-lg bg-[#ec6d13] text-white text-base font-bold hover:scale-105 active:scale-100 transition-transform">Download Enhanced Image</button>
            <button onClick={handleUseForQuotation} className="h-12 w-full sm:w-auto px-5 rounded-lg bg-[#f4f2f0] dark:bg-[#221810]/60 text-[#333333] dark:text-[#f8f7f6] text-base font-bold hover:scale-105 active:scale-100 transition-transform">Use for Quotation</button>
            <button onClick={handlePostToInstagram} className="h-12 w-full sm:w-auto px-5 rounded-lg text-[#333333] dark:text-[#a39e99] text-base font-bold hover:bg-[#f4f2f0]/50 dark:hover:bg-[#221810]/40 transition-colors">Post to Instagram</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SmartProductEnhancerPage;
