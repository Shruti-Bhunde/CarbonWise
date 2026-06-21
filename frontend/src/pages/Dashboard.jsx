import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight, Leaf, Info, Zap, Car, ShoppingBag, Sprout, TreePine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  transport: '#4D7C5B',
  energy: '#F59E0B',
  food: '#EF4444',
  consumption: '#3B82F6',
};

const ICONS = {
  transport: Car,
  energy: Zap,
  food: Leaf,
  consumption: ShoppingBag,
};

export default function Dashboard() {
  const { user, assessment, report, quests, badges, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, navigate, user]);

  if (loading || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[50vh] text-center">
        <div className="w-12 h-12 border-4 border-eco-green border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-bold text-eco-dark">Loading your dashboard...</h2>
      </div>
    );
  }

  const analysis = assessment?.analysis || {};
  const chartData = [
    { name: 'Transport', value: analysis.breakdown?.transport || 0, color: COLORS.transport },
    { name: 'Energy', value: analysis.breakdown?.energy || 0, color: COLORS.energy },
    { name: 'Food', value: analysis.breakdown?.food || 0, color: COLORS.food },
    { name: 'Consumption', value: analysis.breakdown?.consumption || 0, color: COLORS.consumption },
  ];

  return (
    <div className="flex flex-col gap-8 font-sans pb-16 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-eco-green font-bold uppercase tracking-[0.28em] text-xs">
          <TreePine className="w-4 h-4" />
          Dashboard
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-eco-dark tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-base md:text-lg text-eco-textLight">
          Your carbon score, quests, badges, and report memory all update from the same database-backed profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="eco-glass-card bg-white border border-eco-border rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-4 right-4 text-xs font-bold text-eco-textLight/20 select-none uppercase">Scorecard</div>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="66" stroke="#E2E8D8" strokeWidth="12" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="66"
                stroke="#4D7C5B"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={414.6}
                strokeDashoffset={414.6 - (414.6 * (analysis.score || 0)) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black text-eco-dark">{analysis.score || 0}</span>
              <span className="text-[10px] text-eco-textLight font-bold uppercase tracking-widest mt-0.5">Carbon Index</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-eco-dark mt-6">{analysis.category || 'Your footprint score'}</h3>
          <p className="text-sm text-eco-textLight mt-1">{analysis.comparison || 'Finish your assessment to see your footprint category.'}</p>
          <div className="mt-5 text-sm text-eco-green font-semibold flex items-center gap-2">
            <Sprout className="w-4 h-4" />
            {user.streak || 0} day streak
          </div>
        </div>

        <div className="eco-glass-card bg-white border border-eco-border rounded-3xl p-8 flex flex-col justify-center shadow-sm">
          <h3 className="text-base md:text-lg font-bold text-eco-dark mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-eco-green" />
            Emissions breakdown
          </h3>
          <div className="h-52 w-full flex items-center justify-between">
            <div className="w-1/2 h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={58} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-3 pl-6">
              {chartData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-eco-textLight font-semibold">{item.name}</span>
                  </div>
                  <span className="font-bold text-eco-dark">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="eco-glass-card bg-[#F8FAF5] border border-eco-green/10 rounded-3xl p-6 md:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-eco-green">
          <Leaf className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-[0.28em]">AI field report</span>
        </div>
        <p className="text-base text-eco-dark leading-relaxed">{analysis.report || 'Your report will appear after registration.'}</p>
        <div className="border-t border-eco-border pt-4 flex justify-between items-center gap-4">
          <span className="text-sm text-eco-textLight font-medium">Report memory is stored on the server and reused by the chatbot.</span>
          <Link to="/report" className="text-sm text-eco-green font-bold flex items-center gap-1 hover:underline">
            Open reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-4">
          <h3 className="text-base md:text-lg font-bold text-eco-dark uppercase tracking-[0.28em]">Recommendations</h3>
          <div className="flex flex-col gap-3">
            {(analysis.recommendations || []).map((rec, index) => {
              const IconComponent = ICONS[rec.category] || Leaf;
              return (
                <div key={index} className="bg-white border border-eco-border rounded-2xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-2.5 bg-eco-light rounded-xl text-eco-green">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-base font-bold text-eco-dark">{rec.title}</span>
                    <p className="text-sm text-eco-textLight leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#1E352F] text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg h-full">
          <div>
            <h4 className="text-2xl font-extrabold mb-2">Today’s quests</h4>
            <p className="text-sm text-eco-light/80 leading-relaxed">
              Three tasks are assigned each day. Finish all three to keep your streak alive.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {quests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                <div className="text-sm font-bold">{quest.title}</div>
                <div className="text-xs text-eco-light/80 mt-1">{quest.difficulty} • {quest.points} pts</div>
              </div>
            ))}
          </div>
          <Link
            to="/challenges"
            className="mt-6 bg-eco-green hover:bg-eco-green/90 text-white text-center font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider"
          >
            Open quests
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {badges.slice(0, 3).map((badge) => (
          <div key={badge.id} className={`rounded-2xl border p-4 ${badge.unlocked ? 'bg-white border-eco-border shadow-sm' : 'bg-eco-light/50 border-eco-border/50 opacity-70'}`}>
            <div className="text-sm font-bold text-eco-dark">{badge.name}</div>
            <div className="text-xs text-eco-textLight mt-1">{badge.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
