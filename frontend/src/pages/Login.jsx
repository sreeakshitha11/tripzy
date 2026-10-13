import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Camera, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, 
  UserCheck, Shield, Sparkles, Eye, EyeOff 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
      let msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      if (msg.toLowerCase().includes('bad credentials') || err.response?.status === 401) {
        msg = 'Invalid email or password. Please check your spelling or use a 1-click demo account above.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPw) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPw);
    setLoading(true);
    try {
      await login(demoEmail, demoPw);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error(err);
      let msg = err.response?.data?.message || 'Demo login failed.';
      if (msg.toLowerCase().includes('bad credentials')) {
        msg = 'Demo login failed: Incorrect password or user not found. Please try again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-moss-200 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        {/* Brand */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-pine hover:bg-forest items-center justify-center text-white shadow-xl shadow-trail-500/20 mb-4">
            <Camera className="w-7 h-7 text-forest" />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-forest tracking-tight">
            Welcome to Tripzy
          </h2>
          <p className="text-moss-500 text-sm mt-2">
            See a Place. Find Your People. Travel Together.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Demo One-Click Sign-in */}
        <div className="p-4 rounded-2xl bg-white border border-moss-200 space-y-2.5">
          <div className="text-[11px] font-bold text-trail-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Instant 1-Click Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('alex@tripzy.com', 'Travel@123')}
              className="px-2.5 py-2 rounded-xl bg-moss-100 hover:bg-moss-200 border border-moss-200 text-left transition"
            >
              <div className="text-xs font-bold text-forest">Alex Chen</div>
              <div className="text-[10px] text-trail-600">Solo Explorer</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('sarah@tripzy.com', 'Travel@123')}
              className="px-2.5 py-2 rounded-xl bg-moss-100 hover:bg-moss-200 border border-moss-200 text-left transition"
            >
              <div className="text-xs font-bold text-forest">Sarah Jenkins</div>
              <div className="text-[10px] text-amber-800">Trip Organizer</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@tripzy.com', 'Admin@123')}
              className="px-2.5 py-2 rounded-xl bg-moss-100 hover:bg-moss-200 border border-moss-200 text-left transition"
            >
              <div className="text-xs font-bold text-forest">Admin</div>
              <div className="text-[10px] text-trail-700">Moderator</div>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-moss-500 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-moss-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-moss-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-moss-500">Password</label>
              <Link to="/forgot-password" className="text-xs text-trail-600 hover:text-trail-600">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-moss-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-moss-200 rounded-xl pl-10 pr-11 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-moss-500 hover:text-moss-600 transition"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[11px] text-moss-500 mt-1 flex items-center justify-between">
              <span>Demo password: <strong className="text-trail-600 font-mono">Travel@123</strong></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition shadow-lg shadow-trail-500/20 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Signing in..." : "Sign In to Tripzy"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-moss-500 pt-2 border-t border-moss-200">
          Don't have an account?{' '}
          <Link to="/register" className="text-trail-600 hover:text-trail-600 font-bold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
