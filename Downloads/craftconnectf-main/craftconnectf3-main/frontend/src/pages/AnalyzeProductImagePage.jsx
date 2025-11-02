import React, { useRef, useState } from "react";

const AnalyzeProductImagePage = () => {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const onClickUpload = () => inputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const onProcess = () => {
    // TODO: wire to API then navigate to insights
    console.log("Process Data & Get Insights clicked");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f8f7f6] dark:bg-[#221810] text-[#181411] dark:text-[#f8f7f6]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#e6e0db] dark:border-[#443d38] px-6 md:px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="size-6 text-[#ec6d13]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/></svg>
          </div>
          <h2 className="text-lg font-bold tracking-[-0.015em]">Craft Connect</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="h-10 rounded-full bg-[#ec6d13] px-4 text-sm font-bold text-white hover:bg-[#d8620f]">Help</button>
          <div className="size-10 rounded-full bg-gray-300" />
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center py-10 md:py-20">
        <div className="w-full max-w-2xl px-4 flex flex-col gap-8">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-black tracking-tight">Analyze Your Product Image</p>
            <p className="mt-2 text-[#897261] dark:text-[#a19083]">Get AI-Powered Insights for your craft</p>
          </div>

          <div className="flex flex-col p-4 bg-white dark:bg-[#221810] shadow-sm rounded-lg">
            <div
              onClick={onClickUpload}
              onDrop={onDrop}
              onDragOver={(e)=>e.preventDefault()}
              className="flex flex-col items-center gap-6 rounded border-2 border-dashed border-[#e6e0db] dark:border-[#443d38] px-6 py-14 hover:border-[#ec6d13] hover:bg-[#ec6d13]/5 dark:hover:bg-[#ec6d13]/10 transition-colors duration-300 cursor-pointer"
            >
              <span className="material-symbols-outlined text-5xl text-[#897261] dark:text-[#a19083]">add_a_photo</span>
              <div className="flex max-w-[480px] flex-col items-center gap-2">
                <p className="text-lg font-bold tracking-tight text-center">Tap or Drag to Upload Product Image</p>
                <p className="text-sm text-[#897261] dark:text-[#a19083] text-center">Supports JPG, PNG formats.</p>
                {fileName && (
                  <p className="mt-2 text-sm text-[#181411] dark:text-[#f8f7f6]">Selected: {fileName}</p>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFileChange} />
            </div>
          </div>

          <div className="flex justify-center px-4 py-3">
            <button
              onClick={onProcess}
              className="flex h-12 w-full max-w-[480px] items-center justify-center rounded-full bg-[#ec6d13] px-5 text-base font-bold text-white hover:bg-[#d8620f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ec6d13]/70"
            >
              Process Data & Get Insights
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyzeProductImagePage;
