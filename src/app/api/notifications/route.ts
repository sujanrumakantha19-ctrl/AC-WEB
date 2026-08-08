import { NextRequest } from "next/server";
import Notification from "@/models/Notification";
import { ok, badRequest, route, requireUser } from "@/lib/api-helpers";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const notifications = await Notification.find({ user: auth.userId })
    .populate("relatedAuction", "title lotNumber")
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({ user: auth.userId, read: false });

  return ok({ notifications, unreadCount });
});

export const PATCH = route(async (request: NextRequest) => {
  const auth = await requireUser(request);
  if (auth instanceof Response) return auth;

  const { notificationId, markAll } = await request.json();

  if (markAll) {
    await Notification.updateMany({ user: auth.userId, read: false }, { read: true });
    return ok({ message: "All notifications marked as read" });
  }

  if (notificationId) {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    return ok({ message: "Notification marked as read" });
  }

  return badRequest("notificationId or markAll required");
});
