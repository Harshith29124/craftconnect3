import React from "react";

const WhatsAppSendPage = () => {
  const handleBack = () => window.history.back();
  const handleClose = () => console.log("Close");
  const handleSend = () => console.log("Send via WhatsApp");

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#F5F5F5]">
      <div className="flex flex-1 justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <button onClick={handleBack} className="p-2 text-gray-700 hover:text-gray-900"><span className="material-symbols-outlined text-2xl">arrow_back</span></button>
            <button onClick={handleClose} className="p-2 text-gray-700 hover:text-gray-900"><span className="material-symbols-outlined text-2xl">close</span></button>
          </div>

          {/* Heading */}
          <div className="px-4">
            <p className="text-[#333333] text-4xl font-black tracking-[-0.033em]">Send Product via WhatsApp</p>
            <p className="text-[#E85D04] text-base">Choose a Recipient</p>
          </div>

          {/* Recipient Card */}
          <div className="rounded-xl bg-[#FFF8F0] p-4 shadow-sm flex flex-col gap-4">
            {/* Segmented */}
            <div className="flex">
              <div className="flex h-11 flex-1 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-gray-200">
                <label className="flex h-full grow cursor-pointer items-center justify-center rounded-md px-2 has-[:checked]:bg-[#E85D04] has-[:checked]:text-white text-gray-600 text-sm font-medium transition-colors">
                  <span className="truncate">Select from Contacts</span>
                  <input type="radio" name="recipient_type" defaultChecked className="invisible w-0" />
                </label>
                <label className="flex h-full grow cursor-pointer items-center justify-center rounded-md px-2 has-[:checked]:bg-[#E85D04] has-[:checked]:text-white text-gray-600 text-sm font-medium transition-colors">
                  <span className="truncate">Enter Number</span>
                  <input type="radio" name="recipient_type" className="invisible w-0" />
                </label>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="flex h-12 w-full">
                <div className="flex w-full items-stretch rounded-lg h-full">
                  <div className="flex items-center justify-center pl-4 rounded-l-lg border border-r-0 border-gray-200 bg-white text-gray-500">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input className="form-input flex w-full min-w-0 flex-1 rounded-r-lg border border-l-0 border-gray-200 bg-white pl-2 text-base text-[#333333] focus:outline-0 focus:ring-2 focus:ring-[#E85D04]/50 focus:border-[#E85D04]/50" placeholder="Search by name or number..." />
                </div>
              </label>
            </div>
          </div>

          {/* Message Preview */}
          <div className="flex flex-col gap-4">
            <h2 className="px-4 text-[22px] font-bold text-[#333333]">Message Preview</h2>
            <div className="rounded-xl bg-[#FFF8F0] p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col items-start gap-3">
                <div className="w-full rounded-lg bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <img className="w-full aspect-[4/3] rounded-md object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWoEsMeMO5Rkz8RkHwgzI1KlJAyx6wo8-fPGkhEGTkghbsGSJjaXHgqR2NItrVCinjwcitcH5AGL-edkcpJNTc326kf8zr9f8UEz-mrI3iKbaLynC4FTD0N4NS-Yi-D8PVi4EqNDOixIxYB5c1mqO7Ry_Qn8ioLRSGapo5gdtpFNjD1R5MOTAaNsJVy768QfbtzQC1lBeZ4F0cvPefiHB2YbRJjrW6LQH8pWAmhTiF2Lr4Uw_Y0aQP2xYlHXKMFYl_BZ3kyRTXCvM" alt="Azure Bloom Ceramic Vase" />
                  <div className="pt-3">
                    <h3 className="text-lg font-bold text-[#333333]">Azure Bloom Ceramic Vase</h3>
                    <p className="text-base font-semibold text-[#E85D04]">$45.00</p>
                    <p className="mt-1 text-sm text-gray-600">A unique, hand-painted ceramic vase perfect for adding a touch of elegance to any room. Crafted with care by local artisans.</p>
                  </div>
                </div>
                <div className="w-full max-w-md self-start rounded-lg bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <p className="text-base text-[#333333]">Hi [Contact Name]! 👋 I thought you might love this Azure Bloom Ceramic Vase from my collection. It's handcrafted and would look beautiful in your home. Let me know if you're interested!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="px-4 py-3 mt-auto">
            <button onClick={handleSend} className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#25D366] px-6 text-base font-bold text-white shadow-[0_4px_14px_rgba(37,211,102,0.3)] transition-all hover:bg-opacity-90 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle-more"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path><path d="M8 12h.01"></path><path d="M12 12h.01"></path><path d="M16 12h.01"></path></svg>
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSendPage;
