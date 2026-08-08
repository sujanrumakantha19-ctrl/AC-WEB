import { api } from "./api";
import { ENDPOINTS } from "./endpoints";
import type { AppNotification } from "@/types";

export const notificationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<
      { notifications: AppNotification[]; unreadCount: number },
      void
    >({
      query: () => ({ url: ENDPOINTS.notifications.list }),
      providesTags: ["Notification"],
    }),
    markNotificationRead: build.mutation<
      { message: string },
      { notificationId?: string; markAll?: boolean }
    >({
      query: (body) => ({ url: ENDPOINTS.notifications.update, method: "PATCH", body }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationReadMutation } = notificationsApi;
