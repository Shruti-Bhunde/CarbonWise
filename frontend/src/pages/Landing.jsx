import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Leaf, BarChart2, CheckCircle2 } from 'lucide-react';
import { isLoggedIn } from '../utils/storage';

export default function Landing() {
  return (
    <div className="flex flex-col gap-10 pb-12 font-sans">
      {/* Hero Badge */}
      <div className="flex justify-center mt-4 animate-bounce">
        <span className="text-[10px] uppercase font-bold tracking-widest text-eco-green bg-eco-green/10 border border-eco-green/20 px-5 py-2 rounded-full">
          ✨ AI-POWERED SUSTAINABILITY
        </span>
      </div>

      {/* Hero Content */}
      <div className="text-center flex flex-col gap-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-eco-dark leading-tight">
          Understand, Track, and <span className="text-eco-green">Reduce</span> Your Carbon Footprint with AI
        </h1>
        <p className="text-eco-textLight text-sm md:text-base leading-relaxed px-4">
          Embark on a naturalist-modern journey. CarbonWise turns environmental responsibility into a gamified quest for a greener future.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 max-w-lg mx-auto w-full">
        {isLoggedIn() ? (
          <Link 
            to="/dashboard" 
            className="flex-1 bg-eco-green hover:bg-eco-green/90 text-white text-center font-bold py-4 rounded-2xl shadow-lg hover:shadow-eco-green/20 transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link 
              to="/register" 
              className="flex-1 bg-eco-green hover:bg-eco-green/90 text-white text-center font-bold py-4 rounded-2xl shadow-lg hover:shadow-eco-green/20 transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200"
            >
              Sign Up
            </Link>
            <Link 
              to="/login" 
              className="flex-1 bg-white hover:bg-eco-light border border-eco-border text-eco-dark text-center font-bold py-4 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 duration-200"
            >
              Log In
            </Link>
          </>
        )}
      </div>

      {/* Device Mockup Illustration placeholder */}
      <div className="px-4 max-w-4xl mx-auto w-full mt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#1E352F] to-[#4D7C5B] p-8 text-white shadow-xl h-56 flex flex-col justify-end transition-transform hover:scale-[1.01] duration-300">
          <div className="absolute top-6 right-6 text-6xl opacity-10 select-none">🌿</div>
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <p className="text-xs font-bold tracking-widest text-eco-light/80 uppercase">CarbonWise Quest Engine</p>
          <h3 className="text-2xl font-extrabold mt-1">Smart Carbon Tracking</h3>
          <p className="text-xs md:text-sm text-eco-light/80 mt-2 max-w-md">
            AI-driven lifestyle analyzer that converts everyday choices into clear, actionable, rewarding milestones.
          </p>
        </div>
      </div>

      {/* Feature Section List */}
      <div className="flex flex-col gap-8 px-4 max-w-4xl mx-auto w-full mt-4">
        <div className="text-center sm:text-left flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold text-eco-dark">Your Path to a Lower Footprint</h2>
          <p className="text-xs md:text-sm text-eco-textLight">CarbonWise breaks down complex climate data into actionable steps tailored specifically to your lifestyle and habits.</p>
        </div>

        {/* Feature cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-eco-border hover:shadow-md transition-all duration-350">
            <div className="p-3 bg-eco-green/10 text-eco-green rounded-2xl w-fit">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-eco-dark text-base">Understand</h4>
              <p className="text-xs text-eco-textLight mt-2 leading-relaxed">
                Our AI analyzes your daily routines to identify hidden carbon emissions and provides high-fidelity educational context.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-eco-border hover:shadow-md transition-all duration-350">
            <div className="p-3 bg-eco-green/10 text-eco-green rounded-2xl w-fit">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-eco-dark text-base">Track</h4>
              <p className="text-xs text-eco-textLight mt-2 leading-relaxed">
                Monitor your progress through a beautiful, field-guide inspired dashboard that visualizes your impact over time.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-eco-border hover:shadow-md transition-all duration-350">
            <div className="p-3 bg-eco-green/10 text-eco-green rounded-2xl w-fit">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-eco-dark text-base">Reduce</h4>
              <p className="text-xs text-eco-textLight mt-2 leading-relaxed">
                Take on gamified "Eco Quests"—from meatless Mondays to biking streaks—designed to cut emissions effectively.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Built for the Next Gen */}
      <div className="bg-eco-light/60 border-y border-eco-border/70 py-10 px-4 mt-6 text-center">
        <div className="max-w-xl mx-auto flex flex-col gap-3">
          <h3 className="text-2xl font-extrabold text-eco-dark">Built for the Next Generation of Explorers</h3>
          <p className="text-xs md:text-sm text-eco-textLight leading-relaxed">
            We combine rigorous environmental science with modern technology to make climate action intuitive, social, and rewarding.
          </p>
        </div>
      </div>
    </div>
  );
}
