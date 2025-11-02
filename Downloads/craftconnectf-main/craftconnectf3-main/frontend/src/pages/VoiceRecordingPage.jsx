import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceRecordingPage = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);

  const handleMicClick = () => {
    // Toggle recording state for now
    setIsRecording(!isRecording);
    
    // Future: Implement voice recording logic here
    console.log('Microphone clicked:', isRecording ? 'Stop recording' : 'Start recording');
  };

  const handleUploadImage = () => {
    // Future: Implement image upload logic
    console.log('Upload image clicked');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8f7f6] dark:bg-[#221810] group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1 px-4">
            
            {/* Header */}
            <header className="flex justify-center items-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-[#ec6d13] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">storefront</span>
                </div>
                <h1 className="text-3xl font-extrabold text-[#181411] dark:text-white tracking-tight">Craft Connect</h1>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex flex-col flex-grow items-center justify-center text-center px-4 py-16">
              
              {/* Pulsing Microphone Button */}
              <div className="flex justify-center overflow-hidden pb-8">
                <button 
                  onClick={handleMicClick}
                  className={`flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-40 w-40 bg-[#ec6d13] text-white text-base font-bold leading-normal tracking-[0.015em] transition-all duration-300 ${
                    isRecording ? 'animate-pulse' : 'pulsing-mic'
                  }`}
                >
                  <span className="material-symbols-outlined text-white !text-7xl">mic</span>
                </button>
              </div>
              
              {/* Headline */}
              <h3 className="text-[#181411] dark:text-gray-200 tracking-light text-2xl font-bold leading-tight px-4 text-center pb-2 pt-5">
                Tap and Speak to Describe Your Product and Needs
              </h3>
              
              {/* Upload Alternative */}
              <p 
                onClick={handleUploadImage}
                className="text-[#897261] dark:text-gray-400 text-sm font-normal leading-normal pb-3 pt-4 px-4 text-center underline cursor-pointer hover:text-[#ec6d13] dark:hover:text-[#ec6d13] transition-colors"
              >
                or Upload Product Image
              </p>
              
              {/* Recording Status */}
              {isRecording && (
                <div className="mt-4 text-[#ec6d13] text-sm font-medium">
                  🎤 Recording... Tap to stop
                </div>
              )}
              
            </main>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .pulsing-mic {
          box-shadow: 0 0 0 0 rgba(236, 109, 19, 0.7);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(236, 109, 19, 0.4);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 30px rgba(236, 109, 19, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(236, 109, 19, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceRecordingPage;