import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Award, Clock, CalendarCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getPoints, 
  getStreak, 
  getActiveQuests, 
  getHistory, 
  completeQuest, 
  getProfile,
  canGenerateNewQuests,
  areTodayQuestsDone,
  saveGeneratedQuests,
  getQuestsGeneratedDate
} from '../utils/storage';

export default function Challenges() {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quests, setQuests] = useState([]);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [allDoneToday, setAllDoneToday] = useState(false);

  const reloadState = () => {
    setPoints(getPoints());
    setStreak(getStreak());
    setQuests(getActiveQuests());
    setHistory(getHistory());
    setAllDoneToday(areTodayQuestsDone());
  };

  useEffect(() => {
    reloadState();

    // Auto-generate quests if user can (new day, no quests yet)
    if (canGenerateNewQuests() && getActiveQuests().length === 0) {
      handleRefresh();
    }
  }, []);

  const triggerCelebration = () => {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        colors: ['#4D7C5B', '#F59E0B', '#1E352F', '#3B82F6']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        colors: ['#4D7C5B', '#F59E0B', '#1E352F', '#3B82F6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleComplete = (questId) => {
    const quest = completeQuest(questId);
    if (quest) {
      triggerCelebration();
      reloadState();
    }
  };

  const handleRefresh = async () => {
    // Block refresh if quests were already generated today
    if (!canGenerateNewQuests()) return;

    setRefreshing(true);
    try {
      const profile = getProfile();
      if (!profile) return;
      
      const challResponse = await fetch('http://localhost:5000/generate-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await challResponse.json();
      
      // Ensure exactly 3 quests
      const questsToSave = Array.isArray(data) ? data.slice(0, 3) : data;
      saveGeneratedQuests(questsToSave);
      reloadState();
    } catch (e) {
      console.error("Failed to refresh quests", e);
    } finally {
      setRefreshing(false);
    }
  };

  const canRefresh = canGenerateNewQuests();
  const questsDate = getQuestsGeneratedDate();

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-5xl mx-auto">
      {/* Top Banner Indicators */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white border border-eco-border rounded-2xl p-5 flex flex-col gap-1 items-center justify-center">
          <Award className="w-6 h-6 text-eco-green" />
          <span className="text-2xl font-black text-eco-dark">{points}</span>
          <span className="text-xs text-eco-textLight font-semibold uppercase tracking-wider">Total Points</span>
        </div>
        <div className="flex-1 bg-white border border-eco-border rounded-2xl p-5 flex flex-col gap-1 items-center justify-center">
          <span className="text-2xl">🔥</span>
          <span className="text-2xl font-black text-eco-dark">{streak} Day</span>
          <span className="text-xs text-eco-textLight font-semibold uppercase tracking-wider">Current Streak</span>
        </div>
      </div>

      {/* Active Quests Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-eco-dark">Today's Quests</h2>
          <p className="text-sm text-eco-textLight flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" />
            {questsDate ? `Generated on ${new Date(questsDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No quests yet'}
          </p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing || !canRefresh}
          title={!canRefresh ? "New quests available tomorrow" : "Generate today's quests"}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all ${
            canRefresh 
              ? 'text-eco-green bg-eco-green/10 border border-eco-green/20 hover:bg-eco-green/20 active:scale-95'
              : 'text-eco-textLight/50 bg-eco-light border border-eco-border cursor-not-allowed'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {canRefresh ? 'Generate' : 'Tomorrow'}
        </button>
      </div>

      {/* All Done Today Banner */}
      {allDoneToday && (
        <div className="bg-eco-green/10 border border-eco-green/20 rounded-2xl p-6 text-center flex flex-col gap-2">
          <span className="text-3xl">🎉</span>
          <h3 className="text-lg font-extrabold text-eco-dark">All Quests Completed!</h3>
          <p className="text-sm text-eco-textLight">
            Great work today! Come back tomorrow for 3 new personalized eco-quests.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-eco-green font-bold mt-1">
            <Clock className="w-3.5 h-3.5" />
            New quests unlock at midnight
          </div>
        </div>
      )}

      {/* Quests List */}
      <div className="flex flex-col gap-5">
        {quests.length === 0 && !allDoneToday ? (
          <div className="text-center py-12 bg-white border border-dashed border-eco-border rounded-2xl">
            <Sparkles className="w-10 h-10 mx-auto text-eco-green opacity-40 mb-3" />
            <p className="text-sm font-medium text-eco-dark">No active quests!</p>
            <p className="text-xs text-eco-textLight mt-1">
              {canRefresh ? 'Tap Generate to pull today\'s quests from Gemini AI.' : 'Come back tomorrow for new quests.'}
            </p>
          </div>
        ) : (
          quests.map(quest => (
            <div 
              key={quest.id} 
              className="eco-glass-card bg-white border border-eco-border rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md"
            >
              {/* Checkbox and Difficulty Row */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!quest.completed}
                    onChange={() => handleComplete(quest.id)}
                    className="w-5 h-5 rounded-md border-eco-border text-eco-green focus:ring-eco-green cursor-pointer accent-eco-green"
                  />
                  <span className="bg-eco-light border border-eco-border text-eco-textLight text-xs font-bold px-2.5 py-1 rounded-md">
                    {quest.difficulty}
                  </span>
                </div>
                <span className="text-eco-green text-xs font-bold flex items-center gap-1">
                  ⭐ {quest.points} Pts
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl font-extrabold text-eco-dark">{quest.title}</h3>
                <p className="text-sm text-eco-textLight leading-relaxed">{quest.description}</p>
              </div>

              {/* CO2 Savings Stats */}
              <div className="text-xs font-semibold text-eco-textLight flex items-center gap-1.5 bg-eco-light/50 px-3 py-1.5 rounded-lg w-fit">
                <span>🍃 ~{quest.carbonSavings}kg CO₂ Saved</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent History Log Section */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-base font-bold text-eco-dark flex items-center gap-1.5">
          <span>🕒 Recent History</span>
        </h3>
        <div className="flex flex-col gap-2.5 bg-white/50 border border-eco-border/70 rounded-2xl p-3">
          {history.length === 0 ? (
            <p className="text-sm text-eco-textLight text-center py-4">No completed quests yet.</p>
          ) : (
            history.slice(0, 6).map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white border border-eco-border/40 p-4 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-eco-dark">{item.title}</span>
                  <span className="text-xs text-eco-textLight">{item.displayDate}</span>
                </div>
                <div className="text-right flex flex-col gap-0.5 font-bold text-xs">
                  <span className="text-eco-green">+{item.points} Pts</span>
                  <span className="text-eco-textLight">~{item.carbonSaved}kg CO₂</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
