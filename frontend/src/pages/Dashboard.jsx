import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight, Leaf, Info, Zap, Car, ShoppingBag } from 'lucide-react';
import { getAnalysis, isLoggedIn, recalculateScore } from '../utils/storage';

const COLORS = {
  transport: '#4D7C5B',
  energy: '#F59E0B',
  food: '#EF4444',
  consumption: '#3B82F6'
};

const ICONS = {
  transport: Car,
  energy: Zap,
  food: Leaf,
  consumption: ShoppingBag
};

export default function Dashboard() {
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    // Recalculate score based on completed challenges before displaying
    const updated = recalculateScore();
    const data = updated || getAnalysis();

    if (!data) {
      navigate('/assessment');
      return;
    }
    setAnalysis(data);
  }, [navigate]);

  if (!analysis) return null;

  const chartData = [
    { name: 'Transport', value: analysis.breakdown.transport, color: COLORS.transport },
    { name: 'Energy', value: analysis.breakdown.energy, color: COLORS.energy },
    { name: 'Food', value: analysis.breakdown.food, color: COLORS.food },
    { name: 'Consumption', value: analysis.breakdown.consumption, color: COLORS.consumption }
  ];

  return (
    <div className="flex flex-col gap-8 font-sans pb-16 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-eco-dark tracking-tight">Carbon Analysis</h1>
        <p className="text-sm text-eco-textLight">Your sustainability score improves as you complete daily eco-quests.</p>
      </div>

      {/* Grid: Score + Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Score Ring */}
        <div className="eco-glass-card bg-white border border-eco-border rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-4 right-4 text-xs font-bold text-eco-textLight/20 select-none uppercase">Scorecard</div>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="66" stroke="#E2E8D8" strokeWidth="12" fill="transparent" />
              <circle
                cx="80" cy="80" r="66"
                stroke="#4D7C5B"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={414.6}
                strokeDashoffset={414.6 - (414.6 * analysis.score) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black text-eco-dark">{analysis.score}</span>
              <span className="text-[10px] text-eco-textLight font-bold uppercase tracking-widest mt-0.5">Carbon Index</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-eco-dark mt-6">{analysis.category}</h3>
          <p className="text-xs text-eco-textLight mt-1">{analysis.comparison}</p>
        </div>

        {/* Breakdown chart */}
        <div className="eco-glass-card bg-white border border-eco-border rounded-3xl p-8 flex flex-col justify-center shadow-sm">
          <h3 className="text-sm font-bold text-eco-dark mb-4 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-eco-green" />
            Emissions Breakdown
          </h3>
          <div className="h-44 w-full flex items-center justify-between">
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
              {chartData.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
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

      {/* AI Field Report */}
      <div className="eco-glass-card bg-[#F8FAF5] border border-eco-green/10 rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-eco-green">
          <Leaf className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Field Report</span>
        </div>
        <p className="text-sm text-eco-dark leading-relaxed">{analysis.report}</p>
        <div className="border-t border-eco-border pt-4 flex justify-between items-center">
          <span className="text-xs text-eco-textLight font-medium">Score updates with quest completions</span>
          <Link to="/report" className="text-xs text-eco-green font-bold flex items-center gap-1 hover:underline">
            Detailed breakdown <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recommendations & CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-eco-dark uppercase tracking-wider">💡 Recommendations</h3>
          <div className="flex flex-col gap-3">
            {analysis.recommendations && analysis.recommendations.map((rec, index) => {
              const IconComponent = ICONS[rec.category] || Leaf;
              return (
                <div key={index} className="bg-white border border-eco-border rounded-2xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-2.5 bg-eco-light rounded-xl text-eco-green">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-eco-dark">{rec.title}</span>
                    <p className="text-xs text-eco-textLight leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#1E352F] text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg h-full">
          <div>
            <h4 className="text-xl font-extrabold mb-2">Today's Quests ⚡</h4>
            <p className="text-sm text-eco-light/80 leading-relaxed">
              Complete 3 daily eco-quests to improve your score and maintain your streak.
            </p>
          </div>
          <Link 
            to="/challenges" 
            className="mt-6 bg-eco-green hover:bg-eco-green/90 text-white text-center font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider"
          >
            View Quests
          </Link>
        </div>
      </div>
    </div>
  );
}
