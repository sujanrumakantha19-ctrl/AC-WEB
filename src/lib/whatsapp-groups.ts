import mongoose from "mongoose";
import WhatsAppGroup, { IWhatsAppGroup } from "@/models/WhatsAppGroup";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendWhatsAppWelcomeMessage } from "@/lib/whatsapp";

const MAX_RETRY_GROUPS = 50;

export function getGroupFillPercent(group: Pick<IWhatsAppGroup, "members" | "capacity">): number {
  if (!group.capacity) return 100;
  return Math.min(100, Math.round((group.members / group.capacity) * 100));
}

export function isGroupAtLimit(group: Pick<IWhatsAppGroup, "members" | "notifyBefore" | "capacity">): boolean {
  return group.members >= (group.notifyBefore || Math.max(1, Math.floor(group.capacity * 0.9)));
}

async function getAdminUser() {
  return User.findOne({ role: "admin" }).select("_id").lean();
}

async function notifyAdmin(title: string, body: string) {
  try {
    const admin = await getAdminUser();
    if (!admin) return;
    await Notification.create({
      user: admin._id,
      title,
      message: body,
      type: "system",
    });
  } catch (err) {
    console.error("[whatsapp-groups] admin notify failed", err);
  }
}

/**
 * Atomically claim a seat in `group`. Returns the updated group if a seat
 * was successfully reserved, otherwise null. Safe against concurrent writes.
 */
async function claimSeat(groupId: mongoose.Types.ObjectId | string, capacity: number) {
  return WhatsAppGroup.findOneAndUpdate(
    { _id: groupId, members: { $lt: capacity } },
    { $inc: { members: 1 } },
    { new: true }
  ).exec();
}

/**
 * Assign a just-registered user to a WhatsApp group.
 * Reserves a seat so the count is protected at registration time.
 * - Finds the most recently filled active group that still has room (the
 *   "current" group being filled).
 * - If none, the user goes to the pending list.
 * - When the current group crosses the 900-member threshold, notify admin once.
 */
export async function assignNewUserToWhatsAppGroup(userId: string, name: string, phone: string) {
  const user = await User.findById(userId).exec();
  if (!user) return null;

  const hasPhone = phone && phone.replace(/[^\d]/g, "").length >= 10;

  if (!hasPhone) {
    user.whatsAppGroupPending = true;
    user.whatsAppGroupUpdatedAt = new Date();
    await user.save();
    return null;
  }

  const groups = await WhatsAppGroup.find({ status: "active" })
    .sort({ members: -1, createdAt: 1 })
    .limit(MAX_RETRY_GROUPS)
    .exec();

  for (const group of groups) {
    const reserved = await claimSeat(group._id, group.capacity);
    if (!reserved) continue;

    user.whatsAppGroup = reserved._id as mongoose.Types.ObjectId;
    user.whatsAppGroupLinkSent = false;
    user.whatsAppGroupPending = false;
    user.whatsAppGroupUpdatedAt = new Date();
    await user.save();

    if (isGroupAtLimit(reserved) && !reserved.limitNotified) {
      await WhatsAppGroup.updateOne({ _id: reserved._id }, { $set: { limitNotified: true } });
      await notifyAdmin(
        "WhatsApp group nearly full",
        `Group "${reserved.name}" has reached ${reserved.members} members. Add a new WhatsApp group.`
      );
    }

    return reserved;
  }

  user.whatsAppGroupPending = true;
  user.whatsAppGroupUpdatedAt = new Date();
  await user.save();
  return null;
}

/**
 * Send the welcome message (with the user's WhatsApp group invite link).
 * Called at account creation. Link is sent only once per customer.
 */
export async function sendWelcomeMessageToUser(userId: string) {
  const user = await User.findById(userId).exec();
  if (!user) return { sent: false };

  if (user.whatsAppGroupLinkSent) return { sent: false };
  if (!user.phone) return { sent: false };

  let groupLink = "";
  if (user.whatsAppGroup) {
    const group = await WhatsAppGroup.findById(user.whatsAppGroup).exec();
    if (group && group.status === "active" && group.link) {
      groupLink = group.link;
    }
  }

  if (!groupLink) {
    const anyActiveGroup = await WhatsAppGroup.findOne({ status: "active" }).sort({ members: 1 }).exec();
    if (anyActiveGroup && anyActiveGroup.link) {
      groupLink = anyActiveGroup.link;
    }
  }

  const finalLink = groupLink || "https://vksautoservices.org";
  await sendWhatsAppWelcomeMessage(user.name, user.phone, finalLink);
  user.whatsAppGroupLinkSent = true;
  await user.save();

  return { sent: true, link: finalLink };
}

/**
 * Process pending customers against an active group. Atomically fills the
 * group and reserves each customer's seat. The welcome message itself is
 * sent later from the registration flow.
 */
export async function processPendingForGroup(groupId: string) {
  const group = await WhatsAppGroup.findById(groupId).exec();
  if (!group || group.status !== "active") return { assigned: 0, remaining: 0 };

  const pendingUsers = await User.find({ whatsAppGroupPending: true })
    .sort({ whatsAppGroupUpdatedAt: 1, createdAt: 1 })
    .exec();

  let assigned = 0;
  for (const user of pendingUsers) {
    const reserved = await claimSeat(group._id, group.capacity);
    if (!reserved) break;

    user.whatsAppGroup = reserved._id as mongoose.Types.ObjectId;
    user.whatsAppGroupLinkSent = false;
    user.whatsAppGroupPending = false;
    user.whatsAppGroupUpdatedAt = new Date();
    await user.save();
    assigned++;
  }

  const remaining = await User.countDocuments({ whatsAppGroupPending: true });
  return { assigned, remaining };
}

export async function processPendingForNewGroup(groupId: string) {
  return processPendingForGroup(groupId);
}

export { isGroupAtLimit as shouldNotifyGroupLimit, getAdminUser };
