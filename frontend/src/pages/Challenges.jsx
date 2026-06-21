import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Clock, Sparkles, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { questsApi } from '../utils/api';

export default function Challenges() {
  const { user, quests, history, loading, refresh } = useAuth();
  const [localQuests, setLocalQuests] = useState([]);
  const [busyQuestId, setBusyQuestId] = useState(null);

  useEffect(() => {
    setLocalQuests(quests);
  }, [quests]);

  useEffect(() => {
    if (!loading && !user) {
      window.location.assign('/login');
    }
  }, [loading, user]);

  const triggerCelebration = () => {
    const duration = 1500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        colors: ['#4D7C5B', '#F59E0B', '#1E352F', '#3B82F6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        colors: ['#4D7C5B', '#F59E0B', '#1E352F', '#3B82F6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleComplete = async (questId) => {
    setBusyQuestId(questId);
    try {
      await questsApi.complete(questId);
      triggerCelebration();
      await refresh();
      setLocalQuests((previous) => previous.map((quest) => (quest.id === questId ? { ...quest, completed: true } : quest)));
    } catch (error) {
      console.error(error);
    } finally {
      setBusyQuestId(null);
    }
  };

  if (loading || !user) {
    return <div className="text-center py-12 text-eco-textLight">Loading your quests...</div>;
  }

  const allDoneToday = localQuests.length > 0 && localQuests.every((quest) => quest.completed);

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <div className="flex gap-4">
        <div className="flex-1 bg-white border border-eco-border rounded-2xl p-5 flex flex-col gap-1 items-center justify-center">
          <Award className="w-6 h-6 text-eco-green" />
          <span className="text-2xl font-black text-eco-dark">{user.points || 0}</span>
          <span className="text-xs text-eco-textLight font-semibold uppercase tracking-wider">Total Points</span>
        </div>
        <div className="flex-1 bg-white border border-eco-border rounded-2xl p-5 flex flex-col gap-1 items-center justify-center">
          <span className="text-2xl">🔥</span>
          <span className="text-2xl font-black text-eco-dark">{user.streak || 0} Day</span>
          <span className="text-xs text-eco-textLight font-semibold uppercase tracking-wider">Current Streak</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-eco-dark">Today’s quests</h2>
          <p className="text-base text-eco-textLight flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4" />
            Three quests refresh automatically each day.
          </p>
        </div>
      </div>

      {allDoneToday && (
        <div className="bg-eco-green/10 border border-eco-green/20 rounded-2xl p-6 text-center flex flex-col gap-2">
          <span className="text-3xl">🎉</span>
          <h3 className="text-xl font-extrabold text-eco-dark">All quests completed</h3>
          <p className="text-base text-eco-textLight">
            Nice work. Your streak and dashboard data are already saved in the database.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-sm text-eco-green font-bold mt-1">
            <Clock className="w-4 h-4" />
            Come back tomorrow for a fresh set
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {localQuests.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-eco-border rounded-2xl">
            <Sparkles className="w-10 h-10 mx-auto text-eco-green opacity-40 mb-3" />
            <p className="text-base font-medium text-eco-dark">No quests available yet.</p>
            <p className="text-sm text-eco-textLight mt-1">Refresh your dashboard or register again if the profile is incomplete.</p>
          </div>
        ) : (
          localQuests.map((quest) => (
            <div
              key={quest.id}
              className="eco-glass-card bg-white border border-eco-border rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!quest.completed}
                    onChange={() => handleComplete(quest.id)}
                    disabled={quest.completed || busyQuestId === quest.id}
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

              <div className="flex flex-col gap-1.5">
                <h3 className="text-2xl font-extrabold text-eco-dark">{quest.title}</h3>
                <p className="text-base text-eco-textLight leading-relaxed">{quest.description}</p>
              </div>

              <div className="text-sm font-semibold text-eco-textLight flex items-center gap-1.5 bg-eco-light/50 px-3 py-1.5 rounded-lg w-fit">
                <span>🍃 ~{quest.carbonSavings}kg CO₂ saved</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-lg font-bold text-eco-dark flex items-center gap-1.5">
          <span>🕒 Recent history</span>
        </h3>
        <div className="flex flex-col gap-2.5 bg-white/50 border border-eco-border/70 rounded-2xl p-3">
          {(history || []).length === 0 ? (
            <p className="text-base text-eco-textLight text-center py-4">No completed quests yet.</p>
          ) : (
            history.slice(0, 6).map((item) => (
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
