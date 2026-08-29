import { NextRequest } from "next/server";
import WhatsAppGroup from "@/models/WhatsAppGroup";
import { ok, badRequest, notFound, route, requireAdmin } from "@/lib/api-helpers";
import { getGroupFillPercent } from "@/lib/whatsapp-groups";

export const PATCH = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const body = await request.json();

  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update.name = body.name;
  if (body.link !== undefined) update.link = body.link;
  if (body.status !== undefined) {
    if (!["active", "inactive"].includes(body.status)) return badRequest("Invalid status");
    update.status = body.status;
  }
  if (body.capacity !== undefined) update.capacity = Number(body.capacity) || 1000;
  if (body.notifyBefore !== undefined) update.notifyBefore = Number(body.notifyBefore) || 900;

  const group: any = await WhatsAppGroup.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!group) return notFound("Group not found");

  return ok({
    success: true,
    id: String(group._id),
    name: group.name,
    link: group.link,
    status: group.status,
    members: group.members,
    fillPercent: getGroupFillPercent(group),
    full: group.members >= group.capacity,
  });
});

export const DELETE = route<{ id: string }>(async (request: NextRequest, { params }) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  await WhatsAppGroup.findByIdAndDelete(id);
  return ok({ success: true });
});
