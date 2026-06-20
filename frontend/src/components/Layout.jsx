import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Award, BarChart2, LogOut } from 'lucide-react';
import { getPoints, getStreak, isLoggedIn, getUser, logoutUser } from '../utils/storage';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Re-read from storage on every render so header always matches page state
  const points = getPoints();
  const streak = getStreak();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/challenges', label: 'Quests', icon: Compass },
    { path: '/report', label: 'Reports', icon: BarChart2 },
    { path: '/badges', label: 'Profile', icon: Award }
  ];

  const authPages = ['/', '/login', '/register', '/assessment'];
  const isMinimal = authPages.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F0] pb-24">
      {/* Top Banner Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-eco-border px-8 py-4 flex justify-between items-center w-full">
        <Link to={loggedIn ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-eco-green flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-bold font-sans text-eco-dark tracking-tight text-lg">CarbonWise</span>
        </Link>
        
        {/* Show stats only when logged in and not on auth pages */}
        {loggedIn && !isMinimal && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full text-xs font-semibold text-amber-700">
              <span className="text-base">🔥</span>
              <span>{streak} Day Streak</span>
            </div>
            <div className="bg-eco-green/10 border border-eco-green/20 px-4 py-1.5 rounded-full text-xs font-semibold text-eco-green">
              ⭐ {points} XP
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <div className="bg-eco-dark/5 border border-eco-border px-3 py-1.5 rounded-full text-xs font-semibold text-eco-dark">
                  👤 {user.name.split(' ')[0]}
                </div>
                <button onClick={() => { logoutUser(); navigate('/'); }} className="bg-white border border-eco-border text-eco-dark px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>

      {/* Bottom Nav - only on authenticated, non-auth pages */}
      {loggedIn && !isMinimal && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-eco-border py-3.5 px-8 flex justify-around items-center z-40 shadow-lg">
          <div className="max-w-6xl w-full mx-auto flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isActive ? 'text-eco-green scale-110 font-bold' : 'text-eco-textLight'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
