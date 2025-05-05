import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, TrendingUp, Activity, Heart, Zap, Target, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WorkoutInsights = () => {
  const [insights, setInsights] = useState(null);
  const [generatedDate, setGeneratedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchInsights = async (generateNew = false) => {
    try {
      setLoading(true);
      if (generateNew) {
        setGenerating(true);
      }
      
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('User not logged in.');
        setLoading(false);
        setGenerating(false);
        return;
      }

      console.log(`Fetching insights with generate=${generateNew}`);
      const response = await axios.get(
        `http://127.0.0.1:5000/api/workout-insights/${userId}?generate=${generateNew}`
      );
      
      console.log("Response:", response.data);
      
      if (response.data.message) {
        // Not enough workouts
        setInsights({ message: response.data.message });
      } else {
        setInsights(response.data.insights);
        setGeneratedDate(response.data.generated_on);
      }
      
      setLoading(false);
      setGenerating(false);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setError('Failed to fetch workout insights');
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights(false);
  }, []);

  const handleGenerateNew = () => {
    fetchInsights(true);
  };

  if (loading && !generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-[#0ff] text-xl animate-pulse">
          Loading workout insights...
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-[#0ff] text-xl animate-pulse">
          Analyzing your workout history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-red-400 text-center p-8 bg-gray-800/70 rounded-lg shadow-md border border-red-500/50">
          <div className="text-xl font-bold mb-4">{error}</div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If not enough data
  if (insights && insights.message) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white rounded backdrop-blur-sm border border-gray-700 hover:border-[#0ff]/50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          
          <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-6">Workout Insights</h1>
            <p className="text-gray-300 text-center py-8">{insights.message}</p>
            <div className="text-center mt-4">
              <button
                onClick={() => navigate('/workout-tracker')}
                className="px-6 py-3 bg-gradient-to-r from-[#0ff] to-[#f0f] text-black rounded-lg font-semibold"
              >
                Log More Workouts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-800/70 text-white rounded backdrop-blur-sm border border-gray-700 hover:border-[#0ff]/50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        
        <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Your Workout Insights</h1>
            
            {/* Generate New Button */}
            <button
              onClick={handleGenerateNew}
              disabled={generating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                generating 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#0ff] to-[#f0f] text-black hover:opacity-90'
              }`}
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Generate New Insights
                </>
              )}
            </button>
          </div>
          
          {/* Last Generated Info */}
          {generatedDate && (
            <div className="text-gray-400 text-sm mb-4">
              Insights generated: {new Date(generatedDate).toLocaleString()}
            </div>
          )}
          
          {/* Consistency Section */}
          <div className="mb-8 bg-gray-900/50 p-6 rounded-lg border border-gray-600">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="text-[#0ff] w-6 h-6" />
              <h2 className="text-xl font-semibold text-white">Consistency Analysis</h2>
            </div>
            <p className="text-gray-300">{insights?.consistency || "No consistency data available."}</p>
          </div>
          
          {/* Progress Section */}
          <div className="mb-8 bg-gray-900/50 p-6 rounded-lg border border-gray-600">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-[#f0f] w-6 h-6" />
              <h2 className="text-xl font-semibold text-white">Progress Patterns</h2>
            </div>
            <p className="text-gray-300">{insights?.progress || "No progress data available."}</p>
          </div>
          
          {/* Areas Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Strength Areas */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="text-yellow-400 w-6 h-6" />
                <h2 className="text-xl font-semibold text-white">Strength Areas</h2>
              </div>
              <ul className="text-gray-300 list-disc pl-5 space-y-1">
                {insights?.strength_areas?.map((area, index) => (
                  <li key={index}>{area}</li>
                )) || <li>No strength areas identified yet.</li>}
              </ul>
            </div>
            
            {/* Improvement Areas */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3 mb-3">
                <Target className="text-[#0ff] w-6 h-6" />
                <h2 className="text-xl font-semibold text-white">Areas to Improve</h2>
              </div>
              <ul className="text-gray-300 list-disc pl-5 space-y-1">
                {insights?.improvement_areas?.map((area, index) => (
                  <li key={index}>{area}</li>
                )) || <li>No improvement areas identified yet.</li>}
              </ul>
            </div>
          </div>
          
          {/* Mood Patterns */}
          <div className="mb-8 bg-gray-900/50 p-6 rounded-lg border border-gray-600">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="text-red-400 w-6 h-6" />
              <h2 className="text-xl font-semibold text-white">Mood Patterns</h2>
            </div>
            <p className="text-gray-300">{insights?.mood_patterns || "No mood data available yet."}</p>
          </div>
          
          {/* Recommendations */}
          <div className="bg-gradient-to-r from-[#0ff]/20 to-[#f0f]/20 p-6 rounded-lg border border-gray-600">
            <h2 className="text-xl font-semibold text-white mb-3">Recommendations</h2>
            <ul className="text-gray-300 list-disc pl-5 space-y-2">
              {insights?.recommendations?.map((rec, index) => (
                <li key={index}>{rec}</li>
              )) || <li>No recommendations available yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutInsights;