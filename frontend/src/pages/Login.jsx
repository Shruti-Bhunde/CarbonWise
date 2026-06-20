import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail } from 'lucide-react';
import { loginUser, isLoggedIn, getAnalysis } from '../utils/storage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const user = loginUser(email.trim().toLowerCase());
    if (!user) {
      setError('No account found with this email. Please register first.');
      return;
    }

    // Check if user has completed assessment
    const analysis = getAnalysis();
    if (analysis) {
      navigate('/dashboard');
    } else {
      navigate('/assessment');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] font-sans px-4">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Logo & Welcome */}
        <div className="text-center flex flex-col gap-3">
          <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg">
            C
          </div>
          <h1 className="text-3xl font-extrabold text-eco-dark">Welcome Back</h1>
          <p className="text-sm text-eco-textLight">
            Sign in to continue your sustainability journey.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-eco-textLight">
          Don't have an account?{' '}
          <Link to="/register" className="text-eco-green font-bold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
