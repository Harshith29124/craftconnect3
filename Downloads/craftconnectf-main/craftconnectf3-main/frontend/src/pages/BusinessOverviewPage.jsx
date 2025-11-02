import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Play, Square, Loader2, ArrowRight } from 'lucide-react';

const BusinessOverviewPage = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (recordedAudio && audioRef.current) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const analyzeBusinessOverview = async () => {
    if (!recordedAudio) {
      setError('Please record your business overview first.');
      return;
    }

    if (recordingDuration < 10) {
      setError('Please record for at least 10 seconds to provide enough context.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', recordedAudio, 'business-overview.webm');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/business/analyze-overview`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Store session data and navigate to summary page
        sessionStorage.setItem('craftConnectSession', JSON.stringify({
          sessionId: data.sessionId,
          businessSummary: data.businessSummary,
          transcript: data.transcript,
          step: 'business_overview_complete'
        }));
        
        navigate('/business-summary');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing business overview:', error);
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 ClassName="text-4xl font-bold text-gray-900 mb-4">
            Tell Us About Your Craft Business
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your story! Tell us about your craft business, your experience, challenges, and dreams. 
            This helps our AI understand your unique situation better.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              {isRecording ? (
                <Mic className="w-12 h-12 text-blue-600 animate-pulse" />
              ) : (
                <MicOff className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {isRecording ? 'Recording Your Story...' : 'Ready to Record'}
            </h2>
            
            {isRecording && (
              <div className="text-lg font-mono text-blue-600 mb-4">
                {formatDuration(recordingDuration)}
              </div>
            )}
            
            {recordingDuration > 0 && !isRecording && (
              <div className="text-lg text-gray-600 mb-4">
                Recorded: {formatDuration(recordingDuration)}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center space-y-4">
            {!isRecording && !recordedAudio && (
              <button
                onClick={startRecording}
                className="flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </button>
            )}

            {recordedAudio && !isAnalyzing && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={playRecording}
                    className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Recording
                  </button>
                  
                  <button
                    onClick={() => {
                      setRecordedAudio(null);
                      setRecordingDuration(0);
                    }}
                    className="flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Record Again
                  </button>
                </div>
                
                <button
                  onClick={analyzeBusinessOverview}
                  className="flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors text-lg"
                >
                  Analyze My Business
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-lg text-gray-600">Analyzing your business overview...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-center">{error}</p>
              </div>
            )}
          </div>

          <audio ref={audioRef} style={{ display: 'none' }} controls />
        </div>

        {/* Helpful Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 What to Include in Your Recording</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">About Your Business:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• What type of crafts do you make?</li>
                <li>• How long have you been crafting?</li>
                <li>• Where are you based?</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Challenges & Goals:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• What challenges do you face?</li>
                <li>• What are your business goals?</li>
                <li>• Who are your ideal customers?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessOverviewPage;