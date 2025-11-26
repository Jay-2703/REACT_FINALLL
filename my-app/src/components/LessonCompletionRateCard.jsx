import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * LessonCompletionRateCard Component
 * Displays lesson completion rate with progress bar and breakdown
 * Fetches data from /api/admin/dashboard/completion-rate endpoint
 */
const LessonCompletionRateCard = ({ period = 'month', onRefresh = null }) => {
  const [displayRate, setDisplayRate] = useState(0);
  const [animateBar, setAnimateBar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState({
    completion_rate: 0,
    target_rate: 85,
    total_lessons: 0,
    completed_lessons: 0,
    meets_target: false
  });

  // Fetch completion rate data from API
  useEffect(() => {
    const fetchCompletionData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/dashboard/completion-rate?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setCompletionData(result.data);
        }
      } catch (error) {
        console.error('Error fetching completion rate data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionData();
  }, [period]);

  const { completion_rate, target_rate, total_lessons, completed_lessons, meets_target } = completionData;

  // Animate number counting on mount
  useEffect(() => {
    setAnimateBar(true);
    const duration = 1000;
    const steps = 60;
    const stepValue = completion_rate / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayRate(parseFloat((stepValue * currentStep).toFixed(1)));
      if (currentStep === steps) {
        setDisplayRate(completion_rate);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [completion_rate]);

  return (
    <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
      {/* Header with Icon and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#bfa45b]/20 flex items-center justify-center text-[#bfa45b] flex-shrink-0 hover:bg-[#bfa45b] hover:text-[#1b1b1b] transition duration-200">
          <CheckCircle2 size={24} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${meets_target ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          <span className="text-xs font-semibold">{meets_target ? '✓' : '✗'}</span>
        </div>
      </div>

      {/* Title and Main Display */}
      <div className="mb-3">
        <p className="text-gray-400 text-sm mb-1">Lesson Completion Rate</p>
        {loading ? (
          <div className="h-10 bg-[#1b1b1b] rounded animate-pulse mb-2"></div>
        ) : (
          <h3 className="text-4xl font-bold text-white">
            {displayRate.toFixed(1)}%
          </h3>
        )}
      </div>

      {/* Benchmark Info */}
      <div className="space-y-2 text-sm">
        <p className="text-gray-400">Target: {target_rate}% | Actual: {completion_rate}% {meets_target ? '✓' : '✗'}</p>
        <p className="text-gray-400">Lessons: {completed_lessons}/{total_lessons} completed</p>
      </div>
    </div>
  );
};

export default LessonCompletionRateCard;
