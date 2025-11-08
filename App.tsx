import React, { useState, useEffect } from 'react';
import { Session } from './types';
import CurrentSessionCard from './components/CurrentSessionCard';
import NextSessionCard from './components/NextSessionCard';
import FullSchedule from './components/FullSchedule';
import { GoogleGenAI, Type } from "@google/genai";

type AppState = 'input' | 'loading' | 'display' | 'error';

// Helper to parse "HH:mm" string into a Date object for today in JST
const parseTime = (timeStr: string): Date => {
  const jstToday = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const [hours, minutes] = timeStr.split(':').map(Number);
  // Handle cases like "24:00" which should be the end of the day
  if (hours === 24 && minutes === 0) {
      const nextDay = new Date(jstToday);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);
      return nextDay;
  }
  jstToday.setHours(hours, minutes, 0, 0);
  return jstToday;
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [userInput, setUserInput] = useState('');
  const [schedule, setSchedule] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleGenerate = async () => {
      if (!userInput.trim()) return;
      setAppState('loading');
      setError(null);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `以下のテキストまたはURLからイベントのスケジュール情報を抽出し、指定されたJSON形式で返してください。
- 時刻は "HH:mm" 形式で統一してください。
- speakerやlevelが不明な場合は空文字列にしてください。

入力:
${userInput}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            start: { type: Type.STRING, description: 'セッションの開始時刻 "HH:mm" 形式' },
                            end: { type: Type.STRING, description: 'セッションの終了時刻 "HH:mm" 形式' },
                            title: { type: Type.STRING, description: 'セッションのタイトル' },
                            speaker: { type: Type.STRING, description: '登壇者。不明な場合は空文字列' },
                            level: { type: Type.STRING, description: 'セッションのレベル。不明な場合は空文字列' },
                        },
                        required: ["start", "end", "title"],
                    }
                },
            },
        });

        const generatedSchedule = JSON.parse(response.text);

        if (Array.isArray(generatedSchedule) && generatedSchedule.length > 0 && 'start' in generatedSchedule[0]) {
             setSchedule(generatedSchedule);
             setAppState('display');
        } else {
             throw new Error("生成されたスケジュールデータの形式が無効です。入力内容をご確認の上、再度お試しください。");
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : 'スケジュールの生成中に予期せぬエラーが発生しました。');
        setAppState('error');
      }
  };

  const handleReset = () => {
      setAppState('input');
      setUserInput('');
      setSchedule([]);
      setError(null);
  }

  const renderInputScreen = () => (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                AI Schedule Navigator
            </h1>
            <p className="text-lg text-gray-600 mt-3">
                スケジュールやURLを貼り付けて、リアルタイムナビゲーターを生成します。
            </p>
        </header>
        <div className="w-full bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 space-y-4">
            <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="ここにスケジュールを貼り付けるか、URLを入力してください..."
                className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
            <button
                onClick={handleGenerate}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
            >
                スケジュールを生成
            </button>
        </div>
    </div>
  );

  const renderLoadingScreen = () => (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">AIがスケジュールを解析中...</h2>
          <p className="text-gray-600 mt-2">最高のナビゲーション体験を準備しています。</p>
      </div>
  );

  const renderErrorScreen = () => (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen text-center p-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600">おっと、問題が発生しました</h2>
            <p className="text-gray-700 mt-4 bg-red-50 p-3 rounded-lg">{error}</p>
            <button
                onClick={handleReset}
                className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all transform hover:scale-105"
            >
                もう一度試す
            </button>
          </div>
      </div>
  );

  const renderScheduleDisplay = () => {
    const jstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));

    const currentSessionIndex = schedule.findIndex(s => {
        try {
            const start = parseTime(s.start);
            const end = parseTime(s.end);
            return jstNow >= start && jstNow < end;
        } catch (e) {
            console.error("Invalid time format in schedule:", s);
            return false;
        }
    });

    const currentSession: Session | undefined = schedule[currentSessionIndex];
    const nextSession: Session | undefined = schedule.find((s, i) => {
        if (i <= currentSessionIndex) return false;
        try {
            // Find the next session that is not a break/etc.
            return !!s.title && s.title.toLowerCase().indexOf('休憩') === -1 && s.title.toLowerCase().indexOf('チェンジ') === -1;
        } catch (e) {
            return false;
        }
    }) ?? schedule[currentSessionIndex + 1];
    
    let progress = 0;
    let remainingSeconds = 0;
    if (currentSession) {
        try {
            const start = parseTime(currentSession.start);
            const end = parseTime(currentSession.end);
            const totalDuration = end.getTime() - start.getTime();
            const elapsed = jstNow.getTime() - start.getTime();
            progress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

            const remainingMillis = end.getTime() - jstNow.getTime();
            remainingSeconds = Math.max(0, Math.floor(remainingMillis / 1000));
        } catch(e) {
            // ignore invalid time format
        }
    }

    const firstSessionStart = schedule.length > 0 ? parseTime(schedule[0].start) : new Date();
    const lastSessionEnd = schedule.length > 0 ? parseTime(schedule[schedule.length - 1].end) : new Date();

    const getUpcomingSession = () => schedule.find(s => parseTime(s.start) > jstNow);

    const renderContent = () => {
      if (jstNow < firstSessionStart) {
        const upcoming = getUpcomingSession();
        return (
          <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">イベント開始前です</h2>
            <p className="text-gray-600 mt-2">開始までしばらくお待ちください。</p>
            {upcoming && <div className="mt-6"><NextSessionCard session={upcoming} /></div>}
          </div>
        );
      }
      
      if (jstNow >= lastSessionEnd) {
        return (
          <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">イベントは終了しました</h2>
            <p className="text-gray-600 mt-2">ご参加いただきありがとうございました。</p>
          </div>
        );
      }

      return (
        <>
          {currentSession ? (
            <CurrentSessionCard session={currentSession} progress={progress} remainingSeconds={remainingSeconds} />
          ) : (
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
               <h2 className="text-xl font-bold text-gray-800">休憩中またはセッション準備中</h2>
               <p className="text-gray-600 mt-2">次のセッションをお待ちください。</p>
            </div>
          )}
          {nextSession && <NextSessionCard session={nextSession} />}
        </>
      );
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <header className="text-center mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-md">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                    Schedule Navigator
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                    🕓 現在時刻: <span className="font-mono font-semibold text-indigo-600">{jstNow.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Tokyo' })}</span> (JST)
                </p>
            </header>

            <main className="w-full max-w-2xl mx-auto space-y-8">
                {renderContent()}
                <FullSchedule schedule={schedule} currentSessionIndex={currentSessionIndex} />
            </main>
            <footer className="mt-8">
                <button
                    onClick={handleReset}
                    className="bg-white/80 backdrop-blur-sm text-indigo-600 font-bold py-2 px-6 rounded-lg hover:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-all transform hover:scale-105 shadow-md"
                >
                    別のスケジュールを生成
                </button>
            </footer>
        </div>
    );
  };


  return (
    <div className="min-h-screen font-sans">
        {appState === 'input' && renderInputScreen()}
        {appState === 'loading' && renderLoadingScreen()}
        {appState === 'error' && renderErrorScreen()}
        {appState === 'display' && renderScheduleDisplay()}
    </div>
  );
};

export default App;
