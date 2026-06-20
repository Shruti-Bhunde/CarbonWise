import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, User, ArrowRight } from 'lucide-react';
import { registerUser } from '../utils/storage';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    registerUser(name.trim(), email.trim().toLowerCase());
    // After registration, go to the assessment quiz
    navigate('/assessment');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] font-sans px-4">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Logo & Welcome */}
        <div className="text-center flex flex-col gap-3">
          <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg">
            C
          </div>
          <h1 className="text-3xl font-extrabold text-eco-dark">Create Account</h1>
          <p className="text-sm text-eco-textLight">
            Join CarbonWise to start your sustainability journey.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-eco-dark flex items-center gap-2">
              <User className="w-4 h-4 text-eco-green" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="bg-white border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-eco-green/30 focus:border-eco-green transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-eco-dark flex items-center gap-2">
              <Mail className="w-4 h-4 text-eco-green" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="bg-white border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-eco-green/30 focus:border-eco-green transition-all"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="bg-eco-green hover:bg-eco-green/90 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-eco-green/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-base"
          >
            <UserPlus className="w-5 h-5" />
            Create Account & Take Assessment
          </button>
        </form>

        <p className="text-center text-sm text-eco-textLight">
          Already have an account?{' '}
          <Link to="/login" className="text-eco-green font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
