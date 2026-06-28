import React from 'react';
import { TestAttempt } from '../types';
import { Trophy, Medal, Zap } from 'lucide-react';

interface LeaderboardProps {
  attempts: TestAttempt[];
}

interface LeaderboardRow {
  name: string;
  roll: string;
  exam: string;
  score: number;
  maxScore: number;
  date: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ attempts }) => {
  // Prepopulate some default high scores from Sikar hub toppers
  const defaultToppers: LeaderboardRow[] = [
    { name: 'Kushal Pareek', roll: 'VIBRANT-2026-004', exam: 'SSC CGL 2026 - Premium Full Syllabus Mock Test (Actual Pattern)', score: 186.5, maxScore: 200, date: '2026-06-23' },
    { name: 'Praveen Saini', roll: 'VIBRANT-2026-118', exam: 'SSC CGL 2026 - Premium Full Syllabus Mock Test (Actual Pattern)', score: 178.0, maxScore: 200, date: '2026-06-24' },
    { name: 'Pooja Choudhary', roll: 'VIBRANT-2026-302', exam: 'Delhi Police Sub-Inspector 2026 - Free Practice Set', score: 47.5, maxScore: 50, date: '2026-06-22' },
    { name: 'Rahul Dev', roll: 'VIBRANT-2026-210', exam: 'SSC CGL 2026 - Premium Full Syllabus Mock Test (Actual Pattern)', score: 168.0, maxScore: 200, date: '2026-06-23' },
    { name: 'Jyoti Shekhawat', roll: 'VIBRANT-2026-884', exam: 'Rajasthan State CET & LDC - Mathematics Special Mock Test', score: 45.0, maxScore: 50, date: '2026-06-24' }
  ];

  // Map user attempts from state to leaderboard rows
  const userAttemptsMapped: LeaderboardRow[] = attempts.map(att => ({
    name: att.userName,
    roll: att.rollNumber,
    exam: att.testTitle,
    score: att.score,
    maxScore: att.totalMarks,
    date: att.completedAt.split('T')[0]
  }));

  // Combine & Sort by percentage score
  const allEntries = [...userAttemptsMapped, ...defaultToppers];
  const sortedEntries = allEntries.sort((a, b) => {
    const percentA = a.score / a.maxScore;
    const percentB = b.score / b.maxScore;
    return percentB - percentA; // descending
  });

  return (
    <div className="w-full min-h-screen py-6 px-6 bg-[#0B1220] transition-colors duration-300 text-xs text-[#F8FAFC]">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Banner */}
        <div className="bg-[#111827] rounded-[20px] p-6 text-white relative overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#3B82F6]/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="bg-[#0B1220] text-[#06B6D4] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                SIKAR BRANCH COMPETITIVE WALL
              </span>
              <h2 className="text-xl font-bold font-sans mt-2 flex items-center justify-center md:justify-start gap-2 text-[#F8FAFC]">
                <Trophy className="w-6 h-6 text-[#06B6D4] animate-bounce" />
                Vibrant Toppers Leaderboard
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1.5 max-w-md leading-relaxed">
                Live rankings of top performing students in SSC, Delhi Police, and State Mock Tests. Attempt mocks to see your rank dynamically updated!
              </p>
            </div>
            
            {/* Quick stats badges */}
            <div className="flex gap-3 bg-[#0B1220] p-3.5 rounded-[12px] border border-[rgba(255,255,255,0.08)]">
              <div className="text-center px-2">
                <span className="text-[9px] text-[#94A3B8] block uppercase font-bold">ACTIVE ASPIRANTS</span>
                <span className="text-sm font-black text-[#F8FAFC]">4,820+</span>
              </div>
              <div className="w-px bg-[rgba(255,255,255,0.08)]" />
              <div className="text-center px-2">
                <span className="text-[9px] text-[#94A3B8] block uppercase font-bold">TOP SCORE %</span>
                <span className="text-sm font-black text-[#06B6D4]">95.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table List */}
        <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#94A3B8] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-2.5 pl-3">Rank</th>
                  <th className="py-2.5">Aspirant Name</th>
                  <th className="py-2.5">Roll Number</th>
                  <th className="py-2.5">Mock Exam Model</th>
                  <th className="py-2.5 text-center">Score Ratio</th>
                  <th className="py-2.5 text-center">Percentage</th>
                  <th className="py-2.5 text-right pr-3">Attempt Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.08)] text-xs text-[#F8FAFC]">
                {sortedEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  const percent = Math.round((entry.score / entry.maxScore) * 100);

                  return (
                    <tr 
                      key={idx} 
                      className={`hover:bg-[#0B1220]/50 transition-all ${
                        isTop3 ? 'font-bold bg-[#3B82F6]/5' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-1.5">
                          {rank === 1 ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-[#F8FAFC] flex items-center justify-center" title="Rank 1">
                              <Medal className="w-3.5 h-3.5" />
                            </div>
                          ) : rank === 2 ? (
                            <div className="w-6 h-6 rounded-full bg-[#111827] text-[#06B6D4] border border-[#06B6D4]/40 flex items-center justify-center" title="Rank 2">
                              <Medal className="w-3.5 h-3.5" />
                            </div>
                          ) : rank === 3 ? (
                            <div className="w-6 h-6 rounded-full bg-[#111827] text-[#3B82F6] border border-[#3B82F6]/40 flex items-center justify-center" title="Rank 3">
                              <Medal className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <span className="w-6 text-center text-[#94A3B8] font-mono font-bold text-xs">{rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Name with topper tag */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px] font-bold text-[#F8FAFC]">{entry.name}</span>
                          {isTop3 && (
                            <Zap className="w-3 h-3 text-[#06B6D4] fill-[#06B6D4]" />
                          )}
                        </div>
                      </td>

                      {/* Roll */}
                      <td className="py-3 font-mono text-[11px] text-[#3B82F6]">
                        {entry.roll}
                      </td>

                      {/* Exam Title */}
                      <td className="py-3 max-w-[180px] truncate text-[#94A3B8]" title={entry.exam}>
                        {entry.exam}
                      </td>

                      {/* Score Ratio */}
                      <td className="py-3 text-center font-black text-[#F8FAFC]">
                        {entry.score} / {entry.maxScore}
                      </td>

                      {/* Percentage Bar */}
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-[12px] text-[10px] font-extrabold bg-[#0B1220] text-[#06B6D4] border border-[rgba(255,255,255,0.08)]">
                          {percent}%
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 text-right pr-3 text-[10px] text-[#94A3B8] font-medium">
                        {entry.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
