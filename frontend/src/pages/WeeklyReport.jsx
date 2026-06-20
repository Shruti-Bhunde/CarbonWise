import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, TrendingUp, ChevronRight, RefreshCw, Award } from 'lucide-react';
import { getPoints, getStreak, getCompletedQuestsCount, getHistory, getReports, setStorageItem } from '../utils/storage';

export default function WeeklyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Progress variables
  const points = getPoints();
  const completedCount = getCompletedQuestsCount();
  const streak = getStreak();
  const history = getHistory();
  const totalCarbonSaved = history.reduce((sum, entry) => sum + (entry.carbonSaved || 0), 0);

  useEffect(() => {
    const savedReports = getReports();
    if (savedReports.length > 0) {
      setReport(savedReports[0]);
    }
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const payload = {
        completedChallengesCount: completedCount,
        carbonSavedTotal: totalCarbonSaved,
        pointsGained: points,
        streak: streak,
        recentHistory: history.slice(0, 5)
      };

      const response = await fetch('/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      // Save in local storage
      const savedReports = getReports();
      const updatedReports = [{ ...data, generatedAt: new Date().toISOString() }, ...savedReports];
      setStorageItem('carbonwise_reports', updatedReports);
      
      setReport(updatedReports[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getWeekRange = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const options = { month: 'short', day: 'numeric' };
    return `${lastWeek.toLocaleDateString('en-US', options).toUpperCase()} - ${today.toLocaleDateString('en-US', options).toUpperCase()}`;
  };

  return (
    <div className="flex flex-col gap-6 font-sans pb-10">
      {/* Page Title & Sub */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-3xl font-extrabold text-eco-dark">Weekly Report</h1>
        <div className="flex items-center gap-1 text-[10px] text-eco-textLight uppercase font-bold tracking-wider mt-0.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{getWeekRange()}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] text-center">
          <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-lg font-bold text-eco-dark">Synthesizing AI Report...</h2>
          <p className="text-[11px] text-eco-textLight">Gemini is aggregating your environmental metrics and drafting your weekly action goals.</p>
        </div>
      ) : report ? (
        <div className="flex flex-col gap-6">
          {/* Main AI report card */}
          <div className="eco-glass-card bg-white border border-eco-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm relative">
            <div className="flex items-center gap-2 text-eco-green">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">AI INSIGHT</span>
            </div>
            
            <h3 className="text-2xl font-black text-eco-dark leading-tight">{report.summaryTitle}</h3>
            
            <p className="text-xs text-eco-textLight leading-relaxed whitespace-pre-line">
              {report.reportBody}
            </p>

            <div className="border-t border-eco-border pt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-eco-green/10 flex items-center justify-center text-eco-green font-bold text-xs">
                👤
              </div>
              <span className="text-[10px] font-semibold text-eco-textLight">Shared with your Study Quest Group</span>
            </div>
          </div>

          {/* Quick Metrics Lists corresponding to Mockup 3 */}
          <div className="flex flex-col gap-3">
            {/* Metric row 1 */}
            <div className="bg-white border border-eco-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
                  ★
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-eco-textLight uppercase font-bold tracking-wider">Total Points</span>
                  <span className="text-sm font-black text-eco-dark">{points} XP</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-eco-green">+25 Report XP</span>
            </div>

            {/* Metric row 2 */}
            <div className="bg-white border border-eco-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center text-eco-green font-bold text-xs">
                  ✔
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-eco-textLight uppercase font-bold tracking-wider">Quests Done</span>
                  <span className="text-sm font-black text-eco-dark">{completedCount} Challenges</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-eco-textLight">Quest Master</span>
            </div>

            {/* Metric row 3 */}
            <div className="bg-white border border-eco-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-sm">
                  🔥
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-eco-textLight uppercase font-bold tracking-wider">Active Streak</span>
                  <span className="text-sm font-black text-eco-dark">{streak} Days</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-eco-textLight">Keep it up!</span>
            </div>
          </div>

          {/* Next Week Goals Section */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-eco-dark">Next Week Goals</h3>
              <button 
                onClick={handleGenerateReport}
                className="text-xs text-eco-green font-bold flex items-center gap-1 hover:underline"
              >
                Regenerate <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {report.nextWeekGoals && report.nextWeekGoals.map((goal, index) => (
                <div key={index} className="bg-white border border-eco-border rounded-2xl p-4 flex justify-between items-center">
                  <div className="flex flex-col gap-0.5 max-w-[75%]">
                    <span className="text-xs font-bold text-eco-dark">{goal.title}</span>
                    <span className="text-[10px] text-eco-textLight leading-relaxed">{goal.description}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-eco-green bg-eco-light border border-eco-border px-2.5 py-1.5 rounded-xl">
                    {goal.points} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center bg-white border border-eco-border rounded-3xl p-6">
          <TrendingUp className="w-10 h-10 text-eco-green opacity-40" />
          <h3 className="text-lg font-bold text-eco-dark">No weekly report generated yet</h3>
          <p className="text-xs text-eco-textLight px-6">
            Review your activity milestones and synthesize a custom carbon summary with actionable guidelines for next week.
          </p>
          <button
            onClick={handleGenerateReport}
            className="mt-2 bg-eco-green hover:bg-eco-green/90 text-white font-bold py-3 px-6 rounded-2xl shadow-md transition-all active:scale-95 text-xs"
          >
            Generate Weekly Report
          </button>
        </div>
      )}
    </div>
  );
}
