import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-moss-200 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-pine hover:bg-forest items-center justify-center text-white shadow-xl shadow-trail-500/20 mb-4">
            <Camera className="w-7 h-7 text-forest" />
          </div>
          <h2 className="text-3xl font-display font-extrabold text-forest tracking-tight">
            Reset Password
          </h2>
          <p className="text-moss-500 text-sm mt-2">
            Enter your email and we'll send you recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <b className="font-semibold block text-forest mb-1">Check your inbox</b>
                If an account exists for <span className="text-trail-600">{email}</span>, password reset instructions have been dispatched.
              </div>
            </div>

            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-moss-100 hover:bg-moss-200 text-forest font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-moss-500 block mb-1">Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-moss-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-white border border-moss-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition shadow-lg shadow-trail-500/20 flex items-center justify-center gap-2"
            >
              Send Recovery Link <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-moss-500 hover:text-forest transition flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
