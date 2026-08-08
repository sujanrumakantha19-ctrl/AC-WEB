import { NextRequest } from "next/server";
import User from "@/models/User";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { assignNewUserToWhatsAppGroup } from "@/lib/whatsapp-groups";
import { created, badRequest, conflict, route } from "@/lib/api-helpers";

async function generateCusId(): Promise<string> {
  const now = new Date();
  const suffix = `${now.getMonth() + 1}${String(now.getFullYear()).slice(-2)}`;
  const count = await User.countDocuments({ cusId: { $regex: new RegExp(`^CUS-\\d+${suffix}$`) } });
  return `CUS-${count + 1}${suffix}`;
}

export const POST = route(async (request: NextRequest) => {
  const body = await request.json();

  if (!body.name || !body.email || !body.password) {
    return badRequest("Name, email, and password are required");
  }

  const normalizedEmail = body.email.toLowerCase().trim();
  const normalizedPhone = body.phone ? normalizeWhatsAppNumber(body.phone) : "";

  const existingByEmail = await User.findOne({ email: normalizedEmail });
  if (existingByEmail) return conflict("Email already registered");

  if (normalizedPhone) {
    const existingByPhone = await User.findOne({ phone: normalizedPhone });
    if (existingByPhone) return conflict("WhatsApp number already registered");
  }

  const cusId = await generateCusId();

  const user = await User.create({
    name: body.name,
    email: normalizedEmail,
    password: body.password,
    phone: normalizedPhone || undefined,
    addressLine1: body.addressLine1,
    addressLine2: body.addressLine2,
    city: body.city,
    state: body.state,
    country: body.country,
    pincode: body.pincode,
    accountType: body.accountType,
    role: "user",
    cusId,
  });

  if (user.phone) {
    assignNewUserToWhatsAppGroup(String(user._id), user.name, user.phone).catch(() => {});
  } else {
    user.whatsAppGroupPending = true;
    await user.save();
  }

  return created({
    message: "Account created successfully",
    user: { id: user._id, cusId: user.cusId, name: user.name, email: user.email, role: user.role },
  });
});
