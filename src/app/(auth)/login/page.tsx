"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/services/auth-api";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/slices/authSlice";
import { errorMessage } from "@/lib/helpers";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [redirectTo, setRedirectTo] = useState("");

  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    const redirect = params.get("redirect");
    if (err) setError(err);
    if (redirect) setRedirectTo(redirect);

    // Block back/forward/swipe navigation on the login screen
    window.history.pushState(null, "", window.location.href);
    const trap = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", trap);
    return () => window.removeEventListener("popstate", trap);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setUser(data.user));

      const target =
        data.user.role === "admin" ? "/admin/dashboard" : redirectTo || "/user/dashboard";
      window.location.href = target;
    } catch (err) {
      setError(errorMessage(err, "Login failed"));
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-surface rounded-3xl p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-16 w-16 object-contain mx-auto" priority />
        <h1 className="text-xl font-extrabold text-on-surface">Welcome Back</h1>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
          Log in to your VKS Autoservices account.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          placeholder="e.g. you@example.com"
          type="email"
          icon="mail"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          placeholder="Enter password"
          type={showPassword ? "text" : "password"}
          icon="key"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          trailing={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="text-outline hover:text-primary transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          }
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant">
            <input
              type="checkbox"
              className="rounded border-outline text-primary focus:ring-primary"
              defaultChecked
            />
            <span>Remember me</span>
          </label>

          <Link href="/reset-password" className="text-primary font-bold hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="text-center text-xs text-on-surface-variant pt-3 border-t border-outline-variant/20">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-primary font-bold hover:underline">
          Register for Free
        </Link>
        <span className="mx-2 text-outline">|</span>
        <Link href="/terms" className="text-primary font-bold hover:underline">
          Terms &amp; Conditions
        </Link>
      </div>
    </div>
  );
}