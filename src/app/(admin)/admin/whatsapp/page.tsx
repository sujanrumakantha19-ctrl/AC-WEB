"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { SkeletonText } from "@/components/ui/skeleton";

type Group = {
  id: string;
  name: string;
  link: string;
  capacity: number;
  notifyBefore: number;
  status: "active" | "inactive";
  members: number;
  fillPercent: number;
  atLimit: boolean;
  full: boolean;
  limitNotified: boolean;
  createdAt: string;
};

export default function AdminWhatsAppServicePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", link: "", capacity: "1000", notifyBefore: "900" });
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/whatsapp/groups");
      const json = await res.json();
      if (json.success) {
        setGroups(json.groups || []);
        setPendingCount(json.pendingCount || 0);
      } else {
        setError(json.message || "Failed to load WhatsApp groups");
      }
    } catch (err) {
      setError("Failed to load WhatsApp groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.link.trim()) return;
    setSaving(true);
    setActionMsg("");
    try {
      const res = await fetch("/api/admin/whatsapp/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          link: form.link.trim(),
          capacity: Number(form.capacity),
          notifyBefore: Number(form.notifyBefore),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMsg(
          `Group created. Pending customers assigned: ${json.processed?.assigned ?? 0}` +
            (json.processed?.remaining ? ` (${json.processed.remaining} still pending)` : "")
        );
        setShowAdd(false);
        setForm({ name: "", link: "", capacity: "1000", notifyBefore: "900" });
        fetchGroups();
      } else {
        setError(json.message || "Failed to create group");
      }
    } catch (err) {
      setError("Failed to create group");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (group: Group) => {
    const next = group.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/whatsapp/groups/${group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (json.success) {
        setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, status: next } : g)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGroup = async (group: Group) => {
    if (!window.confirm(`Delete group "${group.name}"? Assigned customers keep their current group link.`)) return;
    try {
      await fetch(`/api/admin/whatsapp/groups/${group.id}`, { method: "DELETE" });
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const runProcessing = async () => {
    setProcessing(true);
    setActionMsg("");
    try {
      const active = groups.find((g) => g.status === "active" && !g.full);
      if (!active) {
        setActionMsg("No active group with space. Create a new group first.");
        return;
      }
      const res = await fetch(`/api/admin/whatsapp/groups/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: active.name, link: active.link, capacity: active.capacity, notifyBefore: active.notifyBefore }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMsg("Re-processed pending list.");
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-on-surface">WhatsApp Groups</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            New customers are auto-assigned to the active group with space. At {900}+ members you&apos;re alerted to add another group.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="warning">
              <span className="material-symbols-outlined text-sm">pending</span>
              {pendingCount} pending
            </Badge>
          )}
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Group
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {actionMsg}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">{error}</div>
      )}

      {showAdd && (
        <form onSubmit={addGroup} className="bg-white rounded-2xl shadow-sm border border-outline-variant/40 p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-on-surface">New WhatsApp Group</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">Group Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. VKS Buyers Group 1"
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">WhatsApp Invite Link</label>
              <input
                required
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">Capacity</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant">Alert Threshold</label>
              <input
                type="number"
                min={1}
                value={form.notifyBefore}
                onChange={(e) => setForm({ ...form, notifyBefore: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create & Assign Pending"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonText className="h-20 rounded-2xl" />
            <SkeletonText className="h-20 rounded-2xl" />
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-outline-variant/40 p-10 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">group_add</span>
            <p className="text-sm font-bold text-on-surface">No WhatsApp groups yet</p>
            <p className="text-xs text-on-surface-variant">
              Add your first group. New registrations will be welcomed into it automatically.
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl border border-outline-variant/40 p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-extrabold text-on-surface">{g.name}</h3>
                    <Badge variant={g.status === "active" ? "success" : "secondary"}>
                      {g.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                    {g.full && <Badge variant="error">Full</Badge>}
                    {g.atLimit && !g.full && <Badge variant="warning">Near Limit</Badge>}
                  </div>
                  <a
                    href={g.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-medium truncate block max-w-full"
                  >
                    {g.link}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleStatus(g)}
                    title={g.status === "active" ? "Deactivate" : "Activate"}
                    className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {g.status === "active" ? "pause_circle" : "play_circle"}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteGroup(g)}
                    title="Delete group"
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-on-surface-variant mb-1.5">
                  <span>
                    {g.members} / {g.capacity} members
                  </span>
                  <span>{g.fillPercent}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      g.fillPercent >= 90
                        ? "bg-red-500"
                        : g.fillPercent >= 60
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${g.fillPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1.5">
                  Created {new Date(g.createdAt).toLocaleDateString("en-IN")}
                  {g.status === "inactive"
                    ? " — deactivated, new customers skip this group"
                    : " — new customers join this group while space is available"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/40 p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-on-surface">Pending customers</h3>
          <p className="text-xs text-on-surface-variant">
            Registered customers waiting for a group slot (no invite link was sent yet).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={pendingCount > 0 ? "warning" : "secondary"}>
            {pendingCount} pending
          </Badge>
          <button
            onClick={runProcessing}
            disabled={processing || pendingCount === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">sync</span>
            {processing ? "Processing..." : "Process Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
