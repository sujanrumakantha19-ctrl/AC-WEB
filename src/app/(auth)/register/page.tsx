"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { INDIA_CITIES, INDIA_STATES, COUNTRIES, CITY_STATE } from "@/data/location-options";
import { useRegisterMutation, useLoginMutation } from "@/services/auth-api";
import { errorMessage } from "@/lib/helpers";

export default function RegisterPage() {
  const router = useRouter();
  const [register] = useRegisterMutation();
  const [login] = useLoginMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const passwordError = confirmPassword && !passwordsMatch ? "Passwords do not match" : "";

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const passwordPolicyError =
    password && !passwordRegex.test(password)
      ? "Must have 8+ characters with uppercase, lowercase, number and special symbol"
      : "";

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    const matchedState = CITY_STATE[value.trim()];
    if (matchedState) {
      setState(matchedState);
      setCountry("India");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const missing: string[] = [];
    if (!name.trim()) missing.push("Full Name");
    if (!email.trim()) missing.push("Email Address");
    if (!phone.trim()) missing.push("WhatsApp Number");
    if (!addressLine1.trim()) missing.push("Address Line 1");
    if (!city.trim()) missing.push("City");
    if (!state.trim()) missing.push("State");
    if (!country.trim()) missing.push("Country");
    if (!pincode.trim()) missing.push("Pincode");
    if (!password) missing.push("Password");
    if (!confirmPassword) missing.push("Confirm Password");

    if (missing.length > 0) {
      showToast(`Please fill all required fields: ${missing.join(", ")}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      showToast("Please enter a valid 10-digit WhatsApp number");
      return;
    }

    if (!passwordRegex.test(password)) {
      showToast("Password must be at least 8 characters with an uppercase letter, lowercase letter, number and special symbol");
      return;
    }

    if (!passwordsMatch) {
      showToast("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      showToast("Please accept the Terms of Service to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await register({
        name,
        email,
        password,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pincode,
        accountType: "individual",
      }).unwrap();

      if (data.user?.cusId) {
        setCustomerId(data.user.cusId);
      }

      // Auto-login to set the auth cookie, then show success and go to dashboard
      try {
        await login({ email, password }).unwrap();
        setSuccess(true);
        setTimeout(() => { router.push("/user/dashboard"); }, 2000);
      } catch {
        setError("Account created but login failed. Please log in manually.");
        setIsLoading(false);
      }
    } catch (err) {
      setError(errorMessage(err, "Registration failed"));
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-on-surface">Welcome to VKS Autoservices! 🎉</h1>
          <p className="text-sm text-on-surface-variant">Your account has been created successfully.</p>
          {customerId && (
            <div className="mt-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant">
              <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Your Customer ID</p>
              <p className="text-base font-extrabold text-primary mt-0.5">{customerId}</p>
            </div>
          )}
          <p className="text-xs text-on-surface-variant">Redirecting you to your dashboard...</p>
        </div>

        <button
          onClick={() => router.push("/user/dashboard")}
          className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <Image src="/logo.png" alt="VKS Autoservices" width={512} height={512} className="h-16 w-16 object-contain mx-auto" priority />
        <h1 className="text-xl font-extrabold text-on-surface">Join VKS Autoservices</h1>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          Create your verified account to start offering on premium automotive listings across India.
        </p>
      </div>

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-3 rounded-full shadow-xl max-w-[90vw]">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span className="leading-5">{toast}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-xs font-medium text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Enter name"
          type="text"
          icon="badge"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            placeholder="Enter email"
            type="email"
            icon="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="WhatsApp Number"
            placeholder="Enter 10-digit whatsapp number"
            type="tel"
            icon="chat"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={handlePhoneChange}
            required
          />
        </div>

        <Input
          label="Address Line 1"
          placeholder="Enter address line 1"
          type="text"
          icon="home"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          required
        />

        <Input
          label="Address Line 2"
          placeholder="Enter address line 2 (optional)"
          type="text"
          icon="apartment"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Combobox
            label="City"
            placeholder="Search city"
            icon="location_city"
            value={city}
            onChange={handleCityChange}
            options={INDIA_CITIES}
            required
          />
          <Combobox
            label="State"
            placeholder="Search state"
            icon="map"
            value={state}
            onChange={setState}
            options={INDIA_STATES}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Combobox
            label="Country"
            placeholder="Search country"
            icon="public"
            value={country}
            onChange={setCountry}
            options={COUNTRIES}
            required
          />
          <Input
            label="Pincode"
            placeholder="Enter pincode"
            type="text"
            icon="pin"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            required
          />
        </div>

        <Input
          label="Create Password"
          placeholder="Enter password"
          type={showPassword ? "text" : "password"}
          icon="key"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordPolicyError}
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-outline hover:text-primary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          }
        />

        <Input
          label="Confirm Password"
          placeholder="Enter password again"
          type={showConfirmPassword ? "text" : "password"}
          icon="lock"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={passwordError}
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="p-1 text-outline hover:text-primary transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <span className="material-symbols-outlined text-lg">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
            </button>
          }
        />

        <div className="flex items-start gap-2 text-[11px] text-on-surface-variant">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-outline text-primary focus:ring-primary"
            required
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="text-primary font-bold hover:underline">
              Terms of Service
            </Link>{" "}
            and acknowledge prior to offering.
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading || (confirmPassword.length > 0 && !passwordsMatch)}
          className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Create Verified Account"}
        </button>
      </form>

      <div className="text-center text-xs text-on-surface-variant pt-3 border-t border-outline-variant/20">
        Already registered?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Log In Here
        </Link>
      </div>
    </div>
  );
}
