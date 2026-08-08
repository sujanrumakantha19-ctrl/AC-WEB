import { NextRequest } from "next/server";
import Setting from "@/models/Setting";
import { ok, route, requireAdmin } from "@/lib/api-helpers";

const KEY = "registration-fee";
const LEGACY_KEY = "registrationFee";

export const GET = route(async () => {
  const setting = await Setting.findOne({ key: KEY });
  return ok({ value: setting?.value || "" });
});

export const PUT = route(async (request: NextRequest) => {
  const auth = await requireAdmin(request);
  if (auth instanceof Response) return auth;

  const body = await request.json();
  const raw = typeof body.value === "string" ? body.value.trim() : "";
  const fee = Math.max(0, parseInt(raw) || 0);
  const value = String(fee);

  const setting = await Setting.findOneAndUpdate(
    { key: KEY },
    { key: KEY, value },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await Setting.updateOne({ key: LEGACY_KEY }, { $set: { value } }, { upsert: true });

  return ok({ value: setting?.value || value });
});
