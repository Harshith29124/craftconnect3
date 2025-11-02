import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Edit3, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

const BusinessSummaryPage = () => {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [isEditing, setIsEditing] = useState({});
  const [editedSummary, setEditedSummary] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load session data from storage
    const session = sessionStorage.getItem('craftConnectSession');
    if (session) {
      const data = JSON.parse(session);
      setSessionData(data);
      setEditedSummary(data.businessSummary || {});
    } else {
      // Redirect back if no session data
      navigate('/business-overview');
    }
  }, [navigate]);

  const toggleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const updateField = (field, value) => {
    setEditedSummary(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateArrayField = (field, index, value) => {
    setEditedSummary(prev => {
      const newArray = [...(prev[field] || [])];
      if (value.trim() === '') {
        newArray.splice(index, 1);
      } else {
        newArray[index] = value;
      }
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field) => {
    setEditedSummary(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const validateAndProceed = async () => {
    if (!sessionData?.sessionId) {
      setError('Session expired. Please start over.');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/business/validate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          corrections: editedSummary,
          isApproved: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update session data
        const updatedSession = {
          ...sessionData,
          businessSummary: data.updatedSummary,
          step: 'ready_for_product_analysis'
        };
        
        sessionStorage.setItem('craftConnectSession', JSON.stringify(updatedSession));
        navigate('/product-analysis');
      } else {
        throw new Error(data.error || 'Validation failed');
      }
    } catch (error) {
      console.error('Error validating summary:', error);
      setError(`Validation failed: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const renderEditableField = (label, field, type = 'text') => {
    const value = editedSummary[field] || 'Not specified';
    const editing = isEditing[field];

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-800">{label}</h4>
          <button
            onClick={() => toggleEdit(field)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {editing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </button>
        </div>
        
        {editing ? (
          type === 'textarea' ? (
            <textarea
              value={editedSummary[field] || ''}
              onChange={(e) => updateField(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          ) : (
            <input
              type={type}
              value={editedSummary[field] || ''}
              onChange={(e) => updateField(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          )
        ) : (
          <p className="text-gray-700">
            {value === 'Not specified' ? (
              <span className="italic text-gray-500">{value}</span>
            ) : (
              value
            )}
          </p>
        )}
      </div>
    );
  };

  const renderEditableArray = (label, field) => {
    const items = editedSummary[field] || [];
    const editing = isEditing[field];

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-800">{label}</h4>
          <button
            onClick={() => toggleEdit(field)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {editing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </button>
        </div>
        
        {editing ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <input
                key={index}
                type="text"
                value={item}
                onChange={(e) => updateArrayField(field, index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`${label} ${index + 1}...`}
              />
            ))}
            <button
              onClick={() => addArrayItem(field)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add another
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {items.length > 0 ? (
              items.map((item, index) => (
                <p key={index} className="text-gray-700">• {item}</p>
              ))
            ) : (
              <p className="italic text-gray-500">None specified</p>
            )}
          </div>
        )}
      </div>
    );
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Business Summary
          </h1>
          <p className="text-xl text-gray-600">
            Here's what our AI understood about your business. Feel free to edit any information that needs correction.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {renderEditableField('Business Type', 'businessType')}
              {renderEditableField('Business Name', 'businessName')}
              {renderEditableField('Experience Level', 'experience')}
              {renderEditableField('Location', 'location')}
              {renderEditableField('Current Status', 'currentStatus', 'textarea')}
            </div>
            
            <div>
              {renderEditableArray('Main Challenges', 'mainChallenges')}
              {renderEditableArray('Goals', 'goals')}
              {renderEditableArray('Key Strengths', 'keyStrengths')}
              {renderEditableField('Target Market', 'targetMarket', 'textarea')}
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Online Presence</h4>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={editedSummary.hasOnlinePresence === true}
                      onChange={() => updateField('hasOnlinePresence', true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={editedSummary.hasOnlinePresence === false}
                      onChange={() => updateField('hasOnlinePresence', false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => navigate('/business-overview')}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Recording
            </button>
            
            <button
              onClick={validateAndProceed}
              disabled={isValidating}
              className="flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  Continue to Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Original Transcript */}
        {sessionData.transcript && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 Your Original Recording</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 italic">"{sessionData.transcript}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessSummaryPage;