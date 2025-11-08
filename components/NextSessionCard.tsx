import React from 'react';
import { Session } from '../types';

interface NextSessionCardProps {
  session: Session;
}

const NextSessionCard: React.FC<NextSessionCardProps> = ({ session }) => {
  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-md p-6 w-full border border-white/30 transform hover:scale-105 transition-transform duration-300">
      <h2 className="text-sm font-bold text-green-600 mb-2">⏭ 次のセッション</h2>
      <h3 className="text-lg md:text-xl font-semibold text-gray-800">{session.title}</h3>
      {session.speaker && <p className="text-gray-600 mt-2">登壇者：{session.speaker}</p>}
      {session.level && <p className="text-sm text-gray-500 mt-1">{session.level}</p>}
      <p className="text-right text-sm font-bold text-green-700 mt-4">{session.start} - {session.end}</p>
    </div>
  );
};

export default NextSessionCard;