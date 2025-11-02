import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Play, Square, Upload, X, Image as ImageIcon, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const ProductAnalysisPage = () => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const session = sessionStorage.getItem('craftConnectSession');
    if (session) {
      const data = JSON.parse(session);
      if (data.step !== 'ready_for_product_analysis') {
        navigate('/business-overview');
        return;
      }
      setSessionData(data);
    } else {
      navigate('/business-overview');
    }
  }, [navigate]);

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
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setRecordingDuration(0);
      
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

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files.');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image files must be smaller than 10MB.');
        return false;
      }
      return true;
    });

    if (uploadedImages.length + validFiles.length > 10) {
      setError('Maximum 10 images allowed.');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, {
          file,
          preview: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeComprehensive = async () => {
    if (!recordedAudio && uploadedImages.length === 0) {
      setError('Please provide either a voice description or product images (or both) for analysis.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('sessionId', sessionData.sessionId);
      
      if (recordedAudio) {
        formData.append('audio', recordedAudio, 'product-description.webm');
      }
      
      uploadedImages.forEach((imageData, index) => {
        formData.append('images', imageData.file, `product-${index}.${imageData.file.type.split('/')[1]}`);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/analyze-comprehensive`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const updatedSession = {
          ...sessionData,
          productAnalysis: data.productAnalysis,
          productTranscript: data.productTranscript,
          imageAnalyses: data.imageAnalyses,
          step: 'product_analysis_complete'
        };
        
        sessionStorage.setItem('craftConnectSession', JSON.stringify(updatedSession));
        navigate('/insights');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
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

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tell Us About Your Products
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Now let's dive into your products! Record a detailed description of what you make and upload photos. 
            This helps our AI provide the most accurate recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Voice Recording Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              🎤 Voice Description
            </h2>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                {isRecording ? (
                  <Mic className="w-10 h-10 text-blue-600 animate-pulse" />
                ) : (
                  <MicOff className="w-10 h-10 text-gray-400" />
                )}
              </div>
              
              {isRecording && (
                <div className="text-lg font-mono text-blue-600 mb-2">
                  {formatDuration(recordingDuration)}
                </div>
              )}
              
              {recordingDuration > 0 && !isRecording && (
                <div className="text-lg text-gray-600 mb-2">
                  Recorded: {formatDuration(recordingDuration)}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center space-y-4">
              {!isRecording && !recordedAudio && (
                <button
                  onClick={startRecording}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </button>
              )}

              {recordedAudio && (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={playRecording}
                      className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Play
                    </button>
                    
                    <button
                      onClick={() => {
                        setRecordedAudio(null);
                        setRecordingDuration(0);
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition-colors"
                    >
                      Record Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            <audio ref={audioRef} style={{ display: 'none' }} controls />
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What to describe:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Materials you use</li>
                <li>• Techniques and processes</li>
                <li>• Time it takes to make</li>
                <li>• Pricing information</li>
                <li>• What makes your products special</li>
              </ul>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className={`bg-white rounded-2xl shadow-xl p-6 ${dragActive ? 'ring-2 ring-blue-400' : ''}`}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              📸 Product Photos
            </h2>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop images here, or 
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Up to 10 images, max 10MB each
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-800 mb-3">
                  Uploaded Images ({uploadedImages.length}/10)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Button */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/business-summary')}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Summary
            </button>
            
            <button
              onClick={analyzeComprehensive}
              disabled={isAnalyzing || (!recordedAudio && uploadedImages.length === 0)}
              className="flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Products...
                </>
              ) : (
                <>
                  Analyze My Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalysisPage;
