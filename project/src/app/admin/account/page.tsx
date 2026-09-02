'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCog,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

export default function AdminAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      try {
        const res = await fetch('/api/admin/account');
        if (res.ok) {
          const data = await res.json();
          setCurrentEmail(data.email || '');
          setNewEmail(data.email || '');
        }
      } catch (err) {
        console.error('Error loading admin account:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage('Enter your current password to confirm this change.');
      return;
    }

    const emailChanged = newEmail.trim().toLowerCase() !== currentEmail.trim().toLowerCase();
    const wantsPasswordChange = newPassword.length > 0;

    if (!emailChanged && !wantsPasswordChange) {
      setErrorMessage('Change the email or enter a new password before saving.');
      return;
    }

    if (wantsPasswordChange) {
      if (newPassword.length < 8) {
        setErrorMessage('New password must be at least 8 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirmation do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail: emailChanged ? newEmail.trim() : undefined,
          newPassword: wantsPasswordChange ? newPassword : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to update credentials.');
        setIsSaving(false);
        return;
      }

      setSuccessMessage('Credentials updated. Redirecting to sign in with your new details...');
      setTimeout(() => {
        router.push('/admin/login');
      }, 1800);
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-brand-flame animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight flex items-center gap-2">
          <UserCog className="w-6 h-6 text-brand-flame" />
          Admin Account
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Change your own admin login email and/or password. You'll need your current password to confirm any change.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-neutral-500">
          <Mail className="w-3.5 h-3.5" />
          Login Email
        </div>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-brand-flame/50"
          placeholder="admin@pizzious.com"
        />

        <div className="h-px bg-neutral-200" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-neutral-500">
            <Lock className="w-3.5 h-3.5" />
            New Password <span className="text-neutral-600 normal-case font-medium">(leave blank to keep current)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-neutral-500 hover:text-[#111111] transition-colors"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <input
          type={showPasswords ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-brand-flame/50"
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        {newPassword.length > 0 && (
          <input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-brand-flame/50"
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        )}

        <div className="h-px bg-neutral-200" />

        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5" />
          Confirm With Current Password
        </div>
        <input
          type={showPasswords ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-brand-flame/50"
          placeholder="Required for any change"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-flame to-brand-500 hover:from-orange-600 hover:to-orange-500 disabled:opacity-60 text-[#111111] font-black uppercase tracking-wide px-4 py-3.5 rounded-xl text-sm shadow-glow-flame transition-all"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        <p className="text-[11px] text-neutral-500 text-center">
          Changing your email or password signs you out — you'll sign back in with the new details.
        </p>
      </form>
    </div>
  );
}
