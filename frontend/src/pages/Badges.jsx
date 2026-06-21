import React from 'react';
import { Award, Compass, Heart, Shield, Sparkles, Leaf, Flame, Globe2, Sprout, TreePine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Badges() {
  const { user, badges, loading } = useAuth();

  const badgeDefinitions = [
    { id: 'eco_starter', name: 'Eco Starter', desc: 'Complete your first eco-quest', icon: Sparkles, color: 'bg-green-100 text-green-700' },
    { id: 'green_explorer', name: 'Green Explorer', desc: 'Complete 5 quests', icon: Compass, color: 'bg-blue-100 text-blue-700' },
    { id: 'carbon_hero', name: 'Carbon Hero', desc: 'Complete 15 quests', icon: Shield, color: 'bg-purple-100 text-purple-700' },
    { id: 'planet_protector', name: 'Planet Protector', desc: 'Save 50 kg CO₂', icon: Heart, color: 'bg-amber-100 text-amber-700' },
    { id: 'streak_sprinter', name: 'Streak Sprinter', desc: 'Hold a 3-day streak', icon: Flame, color: 'bg-orange-100 text-orange-700' },
    { id: 'streak_guardian', name: 'Streak Guardian', desc: 'Hold a 7-day streak', icon: Shield, color: 'bg-emerald-100 text-emerald-700' },
    { id: 'low_impact_legend', name: 'Low Impact Legend', desc: 'Reach a score of 80+', icon: Leaf, color: 'bg-emerald-100 text-emerald-700' },
    { id: 'quest_collector', name: 'Quest Collector', desc: 'Finish all 3 quests in a day', icon: Award, color: 'bg-cyan-100 text-cyan-700' },
    { id: 'report_reader', name: 'Report Reader', desc: 'Generate or open your latest report', icon: Globe2, color: 'bg-sky-100 text-sky-700' },
    { id: 'growth_keeper', name: 'Growth Keeper', desc: 'Log in again and keep your data synced', icon: Sprout, color: 'bg-lime-100 text-lime-700' },
  ];

  if (loading || !user) {
    return <div className="text-center py-12 text-eco-textLight">Loading badges...</div>;
  }

  const acquiredBadges = badges.filter((badge) => badge.unlocked);

  return (
    <div className="flex flex-col gap-8 font-sans pb-16 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-eco-dark tracking-tight">Sustainability profile</h1>
        <p className="text-base md:text-lg text-eco-textLight">
          Your unlocked badges, progress milestones, and green achievements are now driven by your saved account data.
        </p>
        <TreePine className="absolute right-0 top-0 w-8 h-8 text-eco-green/20 -rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-eco-border rounded-3xl p-5 text-center">
          <div className="text-sm uppercase tracking-[0.28em] text-eco-textLight font-bold">Points</div>
          <div className="text-4xl font-black text-eco-dark mt-2">{user.points || 0}</div>
        </div>
        <div className="bg-white border border-eco-border rounded-3xl p-5 text-center">
          <div className="text-sm uppercase tracking-[0.28em] text-eco-textLight font-bold">Streak</div>
          <div className="text-4xl font-black text-eco-dark mt-2">{user.streak || 0}</div>
        </div>
        <div className="bg-white border border-eco-border rounded-3xl p-5 text-center">
          <div className="text-sm uppercase tracking-[0.28em] text-eco-textLight font-bold">Badges</div>
          <div className="text-4xl font-black text-eco-dark mt-2">{acquiredBadges.length}</div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h3 className="text-xl font-bold text-eco-dark uppercase tracking-[0.28em]">Eco badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {badgeDefinitions.map((badgeDef) => {
            const Icon = badgeDef.icon;
            const badge = badges.find((item) => item.id === badgeDef.id);
            const unlocked = !!badge?.unlocked;

            return (
              <div
                key={badgeDef.id}
                className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all text-center ${
                  unlocked ? 'bg-white border-eco-border shadow-sm hover:shadow-md' : 'bg-eco-light/40 border-eco-border/40 opacity-55 grayscale'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${badgeDef.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-extrabold text-eco-dark">{badgeDef.name}</h4>
                <p className="text-sm md:text-base text-eco-textLight mt-1.5 px-2 font-medium">{badgeDef.desc}</p>
                <span className="text-xs font-bold text-eco-green bg-eco-green/10 border border-eco-green/20 px-3.5 py-1 rounded-full mt-4 uppercase tracking-wider">
                  {unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white border-2 border-eco-green/20 p-12 rounded-3xl text-center shadow-md max-w-3xl mx-auto w-full mt-4 relative overflow-hidden">
        <TreePine className="absolute top-4 left-6 w-10 h-10 text-eco-green/15" />
        <Sprout className="absolute bottom-6 left-12 w-8 h-8 text-eco-green/15" />
        <Leaf className="absolute top-10 right-10 w-8 h-8 text-eco-green/15" />

        <span className="text-7xl block mb-6 select-none relative z-10">🌲</span>
        <h3 className="text-3xl font-extrabold text-eco-dark tracking-tight relative z-10">You’re making a difference.</h3>
        <p className="text-lg md:text-xl text-[#2F4F4F] font-bold leading-relaxed mt-4 max-w-xl mx-auto relative z-10">
          Every completed quest counts. Keep your account synced and your streak active to unlock more badges.
        </p>
      </div>
    </div>
  );
}
