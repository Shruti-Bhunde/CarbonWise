import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Compass, Leaf, Sprout, TreePine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col gap-10 pb-12 font-sans">
      <div className="flex justify-center mt-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-eco-green bg-eco-green/10 border border-eco-green/20 px-5 py-2 rounded-full">
          AI-powered sustainability
        </span>
      </div>

      <div className="text-center flex flex-col gap-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-eco-dark leading-tight">
          Understand, track, and reduce your carbon footprint with AI.
        </h1>
        <p className="text-eco-textLight text-base md:text-lg leading-relaxed px-4">
          CarbonWise turns climate action into a calm, guided journey: register once, answer your footprint questions, and let the dashboard keep your score, quests, streak, and reports in sync.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 max-w-lg mx-auto w-full">
        {!loading && user ? (
          <Link
            to="/dashboard"
            className="flex-1 bg-eco-green hover:bg-eco-green/90 text-white text-center font-bold py-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="flex-1 bg-eco-green hover:bg-eco-green/90 text-white text-center font-bold py-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="flex-1 bg-white hover:bg-eco-light border border-eco-border text-eco-dark text-center font-bold py-4 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
            >
              Login
            </Link>
          </>
        )}
      </div>

      <div className="px-4 max-w-4xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#1E352F] to-[#4D7C5B] p-8 text-white shadow-xl min-h-64 flex flex-col justify-end">
          <div className="absolute top-6 right-6 text-6xl opacity-10 select-none">🌿</div>
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 text-eco-light/80 uppercase text-xs tracking-[0.35em] font-bold">
            <Sprout className="w-4 h-4" />
            CarbonWise journey
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-3">Personalized carbon coaching, daily quests, and report memory.</h2>
          <p className="text-sm md:text-base text-eco-light/85 mt-3 max-w-2xl">
            We store registration, assessment, streaks, reports, and chatbot memory in the database so each login picks up exactly where you left off.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 px-4 max-w-5xl mx-auto w-full mt-4">
        <div className="text-center sm:text-left flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-eco-dark">Built for greener habits</h2>
          <p className="text-base md:text-lg text-eco-textLight">
            Bigger subtitles, softer spacing, and a more nature-forward look make the experience easier to read and more aligned with the product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-4 bg-white/90 p-6 rounded-3xl border border-eco-border shadow-sm">
            <div className="p-3 bg-eco-green/10 text-eco-green rounded-2xl w-fit">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-eco-dark text-lg">Register once</h3>
            <p className="text-sm text-eco-textLight leading-relaxed">
              Email and password are stored in the backend, and your assessment answers are saved alongside your profile.
            </p>
          </div>

          <div className="flex flex-col gap-4 bg-white/90 p-6 rounded-3xl border border-eco-border shadow-sm">
            <div className="p-3 bg-eco-green/10 text-eco-green rounded-2xl w-fit">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-eco-dark text-lg">Track progress</h3>
            <p className="text-sm text-eco-textLight leading-relaxed">
              Your dashboard score, streak, badges, and report all come from persisted data, not temporary local storage.
            </p>
          </div>

          <div className="flex flex-col gap-4 bg-white/90 p-6 rounded-3xl border border-eco-border shadow-sm">
            <div className="p-3 bg-eco-green/10 text-eco-green rounded-2xl w-fit">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-eco-dark text-lg">Complete daily quests</h3>
            <p className="text-sm text-eco-textLight leading-relaxed">
              Three daily quests refresh automatically, and finishing all of them keeps your streak moving forward.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-eco-light/60 border-y border-eco-border/70 py-10 px-4 mt-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 text-eco-green font-bold uppercase tracking-[0.28em] text-xs">
            <TreePine className="w-4 h-4" />
            Carbon-friendly by design
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-eco-dark">Simple, readable, and grounded in sustainability.</h3>
          <p className="text-base md:text-lg text-eco-textLight leading-relaxed">
            The interface now leans into larger subheadings, more generous paragraph spacing, and a soft green backdrop so the app feels lighter on the eyes.
          </p>
        </div>
      </div>
    </div>
  );
}
