import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
}

const CHATMITRA_API_URL = "https://backend.chatmitra.com/developer/api/send_message";

function normalizeWhatsAppNumber(phone) {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

async function sendTest() {
  const token = process.env.CHATMITRA_API_TOKEN;
  const templateName = process.env.CHATMITRA_WELCOME_TEMPLATE_NAME || "account_created_utility_v1_20260822210848";
  const language = process.env.CHATMITRA_WELCOME_TEMPLATE_LANGUAGE || "en_US";
  const phone = "9902262397";

  // Simulate what the code does: strip https:// and query string from group link
  const rawGroupLink = "https://chat.whatsapp.com/EPAnN2jJ0m82Tm65QuPSds";
  const cleanLink = rawGroupLink.split("?")[0].replace(/^https?:\/\//i, "").trim();

  console.log(`Sending test welcome message to ${phone}...`);
  console.log(`Template: ${templateName}`);
  console.log(`Param 1: TestUser`);
  console.log(`Param 2: ${cleanLink}`);

  const payload = {
    recipient_mobile_number: normalizeWhatsAppNumber(phone),
    messages: [
      {
        kind: "template",
        template: {
          name: templateName,
          language,
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: "TestUser" },
                { type: "text", text: cleanLink },
              ],
            },
          ],
        },
      },
    ],
  };

  const res = await fetch(CHATMITRA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("\nChatMitra Response Status:", res.status);
  console.log("ChatMitra Response Body:", text);
}

sendTest().catch(console.error);
