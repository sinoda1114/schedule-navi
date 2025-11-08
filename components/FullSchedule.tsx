import React from 'react';
import { Session } from '../types';

interface FullScheduleProps {
  schedule: Session[];
  currentSessionIndex: number;
}

const FullSchedule: React.FC<FullScheduleProps> = ({ schedule, currentSessionIndex }) => {
  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 w-full border border-white/40">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">🗓️ 全体スケジュール</h2>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {schedule.map((session, index) => {
          const isCurrent = index === currentSessionIndex;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg transition-all duration-300 ${
                isCurrent
                  ? 'bg-indigo-100/80 border-l-4 border-indigo-500 scale-105 shadow-md'
                  : 'bg-gray-50/70 hover:bg-gray-100/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-mono text-sm ${isCurrent ? 'text-indigo-700 font-bold' : 'text-gray-600'}`}>
                  {session.start} - {session.end}
                </p>
                {session.level && (
                   <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    isCurrent ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'
                   }`}>
                     {session.level}
                   </span>
                )}
              </div>
              <h3 className={`mt-1 font-semibold ${isCurrent ? 'text-indigo-900' : 'text-gray-800'}`}>
                {session.title}
              </h3>
              {session.speaker && (
                <p className={`text-sm mt-1 ${isCurrent ? 'text-indigo-800' : 'text-gray-600'}`}>
                  {session.speaker}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FullSchedule;