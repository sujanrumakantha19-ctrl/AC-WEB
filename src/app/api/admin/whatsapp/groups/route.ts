import { NextRequest } from "next/server";
import WhatsAppGroup from "@/models/WhatsAppGroup";
import User from "@/models/User";
import { getAdminUser, getGroupFillPercent, processPendingForGroup } from "@/lib/whatsapp-groups";
import { ok, created, badRequest, route, requireAdmin } from "@/lib/api-helpers";

export const GET = route(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const groups = await WhatsAppGroup.find().sort({ createdAt: -1 }).lean();
  const pendingCount = await User.countDocuments({ whatsAppGroupPending: true });

  return ok({
    success: true,
    groups: groups.map((g: any) => ({
      id: String(g._id),
      name: g.name,
      link: g.link,
      capacity: g.capacity,
      notifyBefore: g.notifyBefore,
      status: g.status,
      members: g.members,
      fillPercent: getGroupFillPercent(g),
      atLimit: g.members >= (g.notifyBefore || Math.floor(g.capacity * 0.9)),
      full: g.members >= g.capacity,
      limitNotified: g.limitNotified,
      createdAt: g.createdAt,
    })),
    pendingCount,
  });
});

export const POST = route(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();

  if (!body.name || !body.link) {
    return badRequest("Group name and invite link are required");
  }

  const group = await WhatsAppGroup.create({
    name: body.name,
    link: body.link,
    capacity: Number(body.capacity) || 1000,
    notifyBefore: Number(body.notifyBefore) || 900,
    status: body.status || "active",
  });

  const result = await processPendingForGroup(String(group._id)).catch(() => ({ assigned: 0, remaining: 0 }));

  return created({
    success: true,
    id: String(group._id),
    name: group.name,
    link: group.link,
    status: group.status,
    processed: result,
  });
});
