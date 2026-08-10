"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "@/services/notifications-api";
import type { AppNotification } from "@/types";

export default function AdminNotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markAsRead = async (id: string) => {
    await markRead({ notificationId: id }).unwrap();
  };

  const markAllAsRead = async () => {
    await markRead({ markAll: true }).unwrap();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-on-surface">Notifications</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          System alerts, group notifications and auction updates for admins.
        </p>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {unreadCount > 0 ? `${unreadCount} Unread` : "All Clear"}
            </Badge>
            <span className="text-xs text-on-surface-variant font-medium">
              {notifications.length} Total
            </span>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              Mark All as Read
            </button>
          )}
        </div>

        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <span className="material-symbols-outlined text-4xl text-outline">notifications_none</span>
            <h3 className="text-base font-extrabold text-on-surface">No Notifications Yet</h3>
            <p className="text-xs text-on-surface-variant">
              Admin notifications such as WhatsApp group alerts and auction system updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: AppNotification) => (
              <div
                key={n._id}
                onClick={() => !n.read && markAsRead(n._id)}
                className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all cursor-pointer hover:shadow-sm ${
                  n.read
                    ? "border-outline-variant/20 opacity-80"
                    : "border-primary/20 bg-primary/[0.02] shadow-xs"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === "higher"
                      ? "bg-error/10 text-error"
                      : n.type === "win"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-primary-container/10 text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {n.type === "higher" ? "south" : n.type === "win" ? "stars" : "notifications"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-on-surface">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {n.message}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] text-outline font-medium whitespace-nowrap">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).replace(/\//g, "-") : "Just now"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}