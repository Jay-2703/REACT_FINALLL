import React, { useState, useEffect } from 'react';
import { Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * TotalActiveStudentsCard Component
 * Displays total active students with trend indicators and breakdown
 * Fetches data from /api/admin/dashboard/students endpoint
 */
const TotalActiveStudentsCard = ({ period = 'month', onRefresh = null }) => {
  const [displayCount, setDisplayCount] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState({
    total_active: 0,
    new_students: 0,
    returning_students: 0,
    percentage_change: 0
  });

  // Fetch students data from API
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/dashboard/students?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setStudentData(result.data);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [period]);

  const { total_active, new_students, returning_students, percentage_change } = studentData;
  const isPositiveTrend = percentage_change > 0;

  // Animate number counting on mount
  useEffect(() => {
    setAnimateCount(true);
    const duration = 1000;
    const steps = 60;
    const stepValue = total_active / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayCount(Math.floor(stepValue * currentStep));
      if (currentStep === steps) {
        setDisplayCount(total_active);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [total_active]);

  return (
    <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
      {/* Header with Icon and Trend */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#bfa45b]/20 flex items-center justify-center text-[#bfa45b] flex-shrink-0 hover:bg-[#bfa45b] hover:text-[#1b1b1b] transition duration-200">
          <Users size={24} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositiveTrend ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {isPositiveTrend ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="text-xs font-semibold">{percentage_change}%</span>
        </div>
      </div>

      {/* Title and Main Display */}
      <div className="mb-3">
        <p className="text-gray-400 text-sm mb-1">Active Students</p>
        {loading ? (
          <div className="h-10 bg-[#1b1b1b] rounded animate-pulse mb-2"></div>
        ) : (
          <h3 className="text-4xl font-bold text-white">
            {displayCount}
          </h3>
        )}
      </div>

      {/* Trend Info */}
      <div className="space-y-2 text-sm">
        <p className="text-gray-400">↑{percentage_change}% vs. Previous Period</p>
        <p className="text-gray-400">New: {new_students} | Returning: {returning_students}</p>
      </div>
    </div>
  );
};

export default TotalActiveStudentsCard;
