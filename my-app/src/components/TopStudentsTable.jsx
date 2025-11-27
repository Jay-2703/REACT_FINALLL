import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Crown } from 'lucide-react';

/**
 * TopStudentsTable Component
 * Displays top performing students by XP in the last 30 days
 */
const TopStudentsTable = ({ students = [], onViewProfile }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use only real data from students prop
  const data = students;
  const totalStudents = data.length;

  const handlePrevious = () => {
    setCurrentPage(Math.max(1, currentPage - 1));
  };

  const handleNext = () => {
    const maxPage = Math.ceil(totalStudents / itemsPerPage);
    setCurrentPage(Math.min(maxPage, currentPage + 1));
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={18} className="text-yellow-400" />;
    if (rank === 2) return <Trophy size={18} className="text-gray-300" />;
    if (rank === 3) return <Trophy size={18} className="text-orange-400" />;
    return <span className="text-gray-400 font-semibold">#{rank}</span>;
  };

  return (
    <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200">
      {/* Header */}
      <h3 className="text-lg font-semibold text-white mb-5">Top Students (Last 30 Days)</h3>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#444]">
              <th className="px-4 py-3 text-left font-semibold text-gray-300 w-12">Rank</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-300">Student Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-300">Level</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-300">Total XP</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-300">Modules</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-300">Badges</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-300">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student, idx) => {
              const rank = student.rank ?? idx + 1;
              return(
              <tr 
                key={rank} 
                className={`border-b border-[#444]/50 hover:bg-white/5 transition duration-200 ${rank <= 3 ? 'bg-[#bfa45b]/5' : ''}`}
              >
                <td className="px-4 py-3 text-white font-bold">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(rank)}
                  </div>
                </td>
                <td className="px-4 py-3 text-white font-medium cursor-pointer hover:text-[#bfa45b]">
                  {student.name}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  <span className="inline-block px-2 py-1 rounded-lg bg-[#bfa45b]/20 text-[#bfa45b] text-xs font-semibold">
                    Level {student.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 font-semibold">
                  {Number(student.xp || 0).toLocaleString()} XP
                </td>
                <td className="px-4 py-3 text-gray-300 font-medium">
                  {student.modules}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-lg bg-purple-900/30 text-purple-400 text-xs font-semibold">
                    {student.badges} badges
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {student.lastActive}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 pt-4 border-t border-[#444] flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalStudents)} of {totalStudents} students
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#bfa45b] text-gray-300 hover:text-[#bfa45b] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span className="text-sm">Previous</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage >= Math.ceil(totalStudents / itemsPerPage)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#2a2a2a] border border-[#444] rounded-lg hover:border-[#bfa45b] text-gray-300 hover:text-[#bfa45b] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopStudentsTable;
