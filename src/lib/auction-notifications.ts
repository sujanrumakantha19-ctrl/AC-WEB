import mongoose from "mongoose";
import Notification from "@/models/Notification";
import User from "@/models/User";

type NotificationType = "offer" | "higher" | "win" | "auction" | "system";

/**
 * Send a notification to every admin user.
 */
export async function notifyAdmins(
  title: string,
  message: string,
  relatedAuction?: mongoose.Types.ObjectId | string
) {
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    if (admins.length === 0) return;
    await Notification.insertMany(
      admins.map((a) => ({
        user: a._id,
        title,
        message,
        type: "system" as const,
        ...(relatedAuction ? { relatedAuction } : {}),
      }))
    );
  } catch (err) {
    console.error("[notify] admin notification failed", err);
  }
}

/**
 * Send a notification to every customer who has paid for access to an auction.
 */
export async function notifyAuctionParticipants(
  auction: { _id: mongoose.Types.ObjectId; title: string },
  title: string,
  message: string,
  type: NotificationType = "auction"
) {
  try {
    const users = await User.find({ paidAccessAuctions: auction._id }).select("_id").lean();
    const ids = new Set<string>();
    for (const u of users) ids.add(String(u._id));
    if (ids.size === 0) return;
    await Notification.insertMany(
      [...ids].map((uid) => ({
        user: uid,
        title,
        message,
        type,
        relatedAuction: auction._id,
      }))
    );
  } catch (err) {
    console.error("[notify] participant notification failed", err);
  }
}

/**
 * Broadcast a notification to every customer account.
 */
export async function notifyAllCustomers(
  title: string,
  message: string,
  relatedAuction?: mongoose.Types.ObjectId | string
) {
  try {
    const users = await User.find({ role: "user" }).select("_id").lean();
    if (users.length === 0) return;
    await Notification.insertMany(
      users.map((u) => ({
        user: u._id,
        title,
        message,
        type: "auction" as const,
        ...(relatedAuction ? { relatedAuction } : {}),
      }))
    );
  } catch (err) {
    console.error("[notify] customer broadcast failed", err);
  }
}

/**
 * Send WhatsApp Auction Reminder 15 minutes before the auction starts.
 * Sent ONLY to users who have registered/paid for that specific auction.
 */
export async function sendAuctionWhatsAppReminders(auction: any) {
  try {
    if (auction.reminderSent) return;

    // Find ONLY users who have paid/unlocked access to this auction
    const registeredUsers = await User.find({
      paidAccessAuctions: auction._id,
      phone: { $exists: true, $ne: "" },
    }).select("name phone").lean();

    if (registeredUsers.length === 0) {
      auction.reminderSent = true;
      await auction.save();
      return;
    }

    const { sendWhatsAppAuctionReminderMessage } = await import("@/lib/whatsapp");
    const roundOneStart = auction.roundTimes?.[0]?.start || auction.startTime;
    const formattedStartTime = roundOneStart
      ? new Date(roundOneStart).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Upcoming";

    const auctionUrl = `https://vksautoservices.org/user/live/${auction._id}`;

    for (const u of registeredUsers) {
      if (u.phone) {
        await sendWhatsAppAuctionReminderMessage(
          u.name,
          u.phone,
          auction.title,
          formattedStartTime,
          auctionUrl
        );
      }
    }

    auction.reminderSent = true;
    await auction.save();
  } catch (err) {
    console.error("[whatsapp] auction reminder failed", err);
  }
}