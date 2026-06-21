import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'We could not sign you in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] font-sans px-4">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center flex flex-col gap-3">
          <div className="w-14 h-14 rounded-2xl bg-eco-green flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg">
            C
          </div>
          <h1 className="text-3xl font-extrabold text-eco-dark">Welcome back</h1>
          <p className="text-base text-eco-textLight">
            Log in to continue with your saved dashboard, streak, quests, and reports.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-eco-dark flex items-center gap-2">
              <Mail className="w-4 h-4 text-eco-green" />
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="aanya@example.com"
              className="bg-white border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-eco-green/30 focus:border-eco-green transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-eco-dark flex items-center gap-2">
              <Lock className="w-4 h-4 text-eco-green" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="bg-white border border-eco-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-eco-green/30 focus:border-eco-green transition-all"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-eco-green hover:bg-eco-green/90 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base disabled:opacity-70"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-eco-textLight">
          Need an account?{' '}
          <Link to="/register" className="text-eco-green font-bold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
