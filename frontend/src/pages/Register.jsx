import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/onboarding');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-moss-200 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-pine hover:bg-forest items-center justify-center text-white shadow-xl shadow-trail-500/20 mb-4">
            <Camera className="w-7 h-7 text-forest" />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-forest tracking-tight">
            Create Your Account
          </h2>
          <p className="text-moss-500 text-sm mt-2">
            Start finding companions and discovering hidden places today.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-moss-500 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-moss-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Alex Chen"
                className="w-full bg-white border border-moss-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-moss-500 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-moss-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@example.com"
                className="w-full bg-white border border-moss-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-moss-500 block mb-1">Phone Number (optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-moss-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-0192"
                className="w-full bg-white border border-moss-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-moss-500 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-moss-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white border border-moss-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-moss-500 block mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-moss-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white border border-moss-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition shadow-lg shadow-trail-500/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Creating Account..." : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-moss-500 pt-2 border-t border-moss-200">
          Already have an account?{' '}
          <Link to="/login" className="text-trail-600 hover:text-trail-600 font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
