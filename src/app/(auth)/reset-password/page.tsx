"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification OTP");
      }

      setMessage(data.message || "Verification code sent to your email.");
      setStep(2);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification OTP");
      }

      setMessage("A new verification code has been sent to your email.");
      setResendTimer(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!passwordRegex.test(newPassword)) {
      setError("Must have 8+ characters with uppercase, lowercase, number and special symbol");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            ? "Enter your registered email address to receive a 6-digit OTP verification code."
            : `Enter the OTP code sent to ${email} and set your new password.`}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {message && !isSubmitted && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-medium text-blue-700">
          {message}
        </div>
      )}

      {isSubmitted ? (
        <div className="space-y-4 text-center">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold">
            Password updated successfully! You can now log in with your new password.
          </div>
          <Link href="/login" className="block w-full">
            <button className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95">
              Return to Login
            </button>
          </Link>
        </div>
      ) : step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            label="Registered Email Address"
            placeholder="you@example.com"
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
            placeholder="e.g. 123456"
            type="text"
            icon="pin"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />
          <Input
            label="New Password"
            placeholder="Enter new strong password"
            type={showPassword ? "text" : "password"}
            icon="key"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            trailing={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="text-outline hover:text-primary transition-colors flex items-center justify-center p-1"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            }
          />
          <p className="text-[11px] text-outline leading-tight">
            Must contain 8+ characters with uppercase, lowercase, number, and special symbol.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Updating Password..." : "Update Password"}
          </button>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Change Email
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || isLoading}
              className="text-primary font-bold hover:underline disabled:opacity-50"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
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
