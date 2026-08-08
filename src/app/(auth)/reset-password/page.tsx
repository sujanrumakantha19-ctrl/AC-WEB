"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 400);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 400);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-xl">lock_reset</span>
        </div>
        <h1 className="text-xl font-extrabold text-on-surface">Reset Password</h1>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
          {isSubmitted
            ? "Your password has been successfully updated."
            : step === 1
            ? "Enter your registered email address to receive an OTP verification code."
            : "Enter the OTP code sent to your email and set your new password."}
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-4 text-center">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 text-xs font-medium">
            Password changed successfully! You can now log in with your new password.
          </div>
          <Link href="/login" className="block w-full">
            <button className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-md">
              Return to Login
            </button>
          </Link>
        </div>
      ) : step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            label="Registered Email Address"
            placeholder="vikram@example.com"
            type="email"
            icon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Sending OTP..." : "Send Verification OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="6-Digit OTP Code"
            placeholder="123456"
            type="text"
            icon="pin"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <Input
            label="New Password"
            placeholder="Enter new strong password"
            type="password"
            icon="key"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      <div className="text-center text-xs pt-2 border-t border-outline-variant/20">
        <Link href="/login" className="text-primary font-bold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
