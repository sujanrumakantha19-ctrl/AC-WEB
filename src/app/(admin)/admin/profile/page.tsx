"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { ProfileFormSkeleton } from "@/components/ui/skeleton";
import { INDIA_CITIES, INDIA_STATES, COUNTRIES, CITY_STATE } from "@/data/location-options";
import { useGetMeQuery, useUpdateMeMutation, useChangePasswordMutation } from "@/services/auth-api";
import { useUploadImageMutation } from "@/services/upload-api";
import { errorMessage } from "@/lib/helpers";
import { compressImage } from "@/lib/compress-image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleTheme } from "@/redux/slices/themeSlice";

export default function AdminProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.theme.mode);

  const { data: meData, isLoading } = useGetMeQuery();
  const [updateMe] = useUpdateMeMutation();
  const [changePassword] = useChangePasswordMutation();
  const [uploadImage] = useUploadImageMutation();
  const user = meData?.user;

  const passwordRegex = /^.{8,}$/;
  const newPasswordPolicyError =
    newPassword && !passwordRegex.test(newPassword)
      ? "Password must be at least 8 characters long"
      : "";
  const newPasswordMatchError =
    confirmNewPassword && newPassword !== confirmNewPassword ? "Passwords do not match" : "";

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone((user.phone || "").replace(/\D/g, "").slice(-10));
    setAddressLine1(user.addressLine1 || "");
    setAddressLine2(user.addressLine2 || "");
    setCity(user.city || "");
    setState(user.state || "");
    setCountry(user.country || "");
    setPincode(user.pincode || "");
    setAvatar(user.avatar || "");
  }, [user]);

  const handleCityChange = (value: string) => {
    setCity(value);
    const matchedState = CITY_STATE[value.trim()];
    if (matchedState) {
      setState(matchedState);
      setCountry("India");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(-10);
    setPhone(digits);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", await compressImage(file));
    setUploadingAvatar(true);
    setError("");
    try {
      const { url } = await uploadImage(fd).unwrap();
      setAvatar(url);
      await updateMe({ avatar: url }).unwrap();
    } catch (err) {
      setError(errorMessage(err, "Image upload failed"));
    }
    setUploadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit WhatsApp number");
      return;
    }

    try {
      await updateMe({
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pincode,
        avatar,
      }).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(errorMessage(err, "Failed to update profile"));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErr("");
    setPasswordMsg("");

    if (!currentPassword) {
      setPasswordErr("Please enter your current password");
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setPasswordErr("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordErr("Passwords do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      const data = await changePassword({ currentPassword, newPassword }).unwrap();
      setPasswordMsg(data.message || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setPasswordOpen(false);
        setPasswordMsg("");
      }, 2000);
    } catch (err) {
      setPasswordErr(errorMessage(err, "Failed to change password"));
    }
    setPasswordSaving(false);
  };

  if (isLoading) {
    return <ProfileFormSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">My Profile</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your personal details, avatar and password.</p>
      </div>
      {error && (
        <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-xs font-medium text-error">
          {error}
        </div>
      )}
      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700">
          Profile updated successfully!
        </div>
      )}

      <div className="bg-white rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-white font-extrabold text-2xl overflow-hidden ring-2 ring-primary/20">
                {avatar ? (
                  <img src={avatar} alt={name || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  name?.charAt(0).toUpperCase() || "A"
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-secondary transition-all active:scale-95 disabled:opacity-50"
                aria-label="Update profile image"
              >
                <span className="material-symbols-outlined text-base">{uploadingAvatar ? "hourglass_top" : "photo_camera"}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-on-surface">{name || "Admin"}</h2>
              <p className="text-xs text-on-surface-variant font-medium mt-1">
                Administrator <span className="text-primary font-extrabold">• {user?.role || "admin"}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter name"
                type="text"
                icon="badge"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                placeholder="Enter email"
                type="email"
                icon="mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex justify-end pt-4 border-t border-outline-variant/20">
              <button
                type="submit"
                className="px-8 py-2.5 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">dark_mode</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-on-surface">Appearance</h3>
              <p className="text-xs text-on-surface-variant">Switch between light and dark mode</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            role="switch"
            aria-checked={themeMode === "dark"}
            aria-label="Toggle dark mode"
            className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
              themeMode === "dark" ? "bg-primary justify-end" : "bg-outline-variant justify-start"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-md transition-all" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setPasswordOpen(!passwordOpen)}
          className="w-full p-6 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <div className="text-left">
              <h3 className="text-base font-extrabold text-on-surface">Change Password</h3>
              <p className="text-xs text-on-surface-variant">Update your account password</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">
            {passwordOpen ? "expand_less" : "expand_more"}
          </span>
        </button>

        {passwordOpen && (
          <form onSubmit={handleChangePassword} className="px-6 pb-6 space-y-4">
            {passwordErr && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-xs font-medium text-error">
                {passwordErr}
              </div>
            )}
            {passwordMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700">
                {passwordMsg}
              </div>
            )}

            <Input
              label="Current Password"
              placeholder="Enter current password"
              type={showCurrentPassword ? "text" : "password"}
              icon="key"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="p-1 text-outline hover:text-primary transition-colors"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-lg">{showCurrentPassword ? "visibility_off" : "visibility"}</span>
                </button>
              }
            />

            <Input
              label="New Password"
              placeholder="Enter new password"
              type={showNewPassword ? "text" : "password"}
              icon="lock"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={newPasswordPolicyError}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="p-1 text-outline hover:text-primary transition-colors"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-lg">{showNewPassword ? "visibility_off" : "visibility"}</span>
                </button>
              }
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              type={showConfirmNewPassword ? "text" : "password"}
              icon="lock_reset"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={newPasswordMatchError}
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="p-1 text-outline hover:text-primary transition-colors"
                  aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-lg">{showConfirmNewPassword ? "visibility_off" : "visibility"}</span>
                </button>
              }
            />

            <div className="flex justify-end pt-4 border-t border-outline-variant/20">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-8 py-2.5 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
