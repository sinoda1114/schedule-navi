import React from 'react';
import { Session } from '../types';
import ProgressBar from './ProgressBar';

interface CurrentSessionCardProps {
  session: Session;
  progress: number;
  remainingSeconds: number;
}

const CurrentSessionCard: React.FC<CurrentSessionCardProps> = ({ session, progress, remainingSeconds }) => {
  const formatTime = (totalSeconds: number) => {
    if (totalSeconds <= 0) {
      return 'まもなく終了';
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `残り ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 w-full border border-white/50 transform hover:scale-105 transition-transform duration-300">
      <h2 className="text-sm font-bold text-indigo-600 mb-2">🎤 現在のセッション</h2>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900">{session.title}</h3>
      {session.speaker && <p className="text-gray-700 mt-2">登壇者：{session.speaker}</p>}
      {session.level && <p className="text-sm text-gray-500 mt-1">{session.level}</p>}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-500">{session.start}</span>
          <span className="text-xs font-medium text-gray-500">{session.end}</span>
        </div>
        <ProgressBar progress={progress} />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm font-semibold text-indigo-600">{Math.floor(progress)}%</p>
          <p className="text-sm font-semibold text-gray-600 font-mono">
            {formatTime(remainingSeconds)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrentSessionCard;