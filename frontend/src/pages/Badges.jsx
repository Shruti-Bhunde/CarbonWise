import React, { useEffect, useState } from 'react';
import { Award, Compass, Heart, Shield, Sparkles, Leaf, Sun, Wind, Droplets } from 'lucide-react';
import { getBadges, getPoints, getHistory } from '../utils/storage';

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setBadges(getBadges());
    setPoints(getPoints());
    setHistory(getHistory());
  }, []);

  // Standard static badge definitions with descriptions and criteria
  const badgeDefinitions = [
    { id: 'eco_starter', name: 'Eco Starter', desc: 'Complete first challenge', icon: Sparkles, color: 'bg-green-100 text-green-700' },
    { id: 'green_explorer', name: 'Green Explorer', desc: 'Complete 5 challenges', icon: Compass, color: 'bg-blue-100 text-blue-700' },
    { id: 'carbon_hero', name: 'Carbon Hero', desc: 'Complete 10 challenges', icon: Shield, color: 'bg-purple-100 text-purple-700' },
    { id: 'planet_protector', name: 'Planet Protector', desc: 'Save 50 kg CO₂', icon: Heart, color: 'bg-amber-100 text-amber-700' }
  ];

  return (
    <div className="flex flex-col gap-8 font-sans pb-16 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-eco-dark tracking-tight">Sustainability Profile</h1>
        <p className="text-base md:text-lg text-eco-textLight">Your unlocked badges, progress milestones, and green achievements.</p>
        <Leaf className="absolute right-0 top-0 w-8 h-8 text-eco-green/20 -rotate-12" />
      </div>

      {/* Gamification Badges Grid */}
      <div className="flex flex-col gap-5">
        <h3 className="text-lg font-bold text-eco-dark uppercase tracking-wider">Eco Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {badgeDefinitions.map((badgeDef) => {
            const Icon = badgeDef.icon;
            const isUnlocked = badges.some(b => b.id === badgeDef.id);
            
            return (
              <div 
                key={badgeDef.id} 
                className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all text-center ${
                  isUnlocked 
                    ? 'bg-white border-eco-border shadow-sm hover:shadow-md' 
                    : 'bg-eco-light/40 border-eco-border/40 opacity-50 grayscale'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${badgeDef.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-eco-dark">{badgeDef.name}</h4>
                <p className="text-xs md:text-sm text-eco-textLight mt-1.5 px-2 font-medium">{badgeDef.desc}</p>
                {isUnlocked ? (
                  <span className="text-xs font-bold text-eco-green bg-eco-green/10 border border-eco-green/20 px-3.5 py-1 rounded-full mt-4 uppercase tracking-wider">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-xs font-bold text-eco-textLight bg-eco-light border border-eco-border px-3.5 py-1 rounded-full mt-4 uppercase tracking-wider">
                    Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sustainability Impact Stat Card */}
      <div className="bg-white border-2 border-eco-green/20 p-12 rounded-3xl text-center shadow-md max-w-3xl mx-auto w-full mt-4 relative overflow-hidden">
        {/* Floating background icons */}
        <Sun className="absolute top-4 left-6 w-10 h-10 text-amber-400/20 animate-pulse" />
        <Wind className="absolute bottom-6 left-12 w-8 h-8 text-blue-400/20" />
        <Droplets className="absolute top-10 right-10 w-8 h-8 text-blue-400/20" />
        <Leaf className="absolute bottom-8 right-6 w-10 h-10 text-eco-green/20 rotate-45" />

        <span className="text-7xl block mb-6 select-none relative z-10">🌲</span>
        <h3 className="text-3xl font-extrabold text-eco-dark tracking-tight relative z-10">You're making a difference.</h3>
        <p className="text-lg md:text-xl text-[#2F4F4F] font-bold leading-relaxed mt-4 max-w-xl mx-auto relative z-10">
          Every completed quest counts. Keep updating your stats to protect ecosystems worldwide!
        </p>
      </div>
    </div>
  );
}
