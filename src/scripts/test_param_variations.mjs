import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const CHATMITRA_API_URL = "https://backend.chatmitra.com/developer/api/send_message";

function normalizeWhatsAppNumber(phone) {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

async function sendParamTest(phone, param2) {
  const token = process.env.CHATMITRA_API_TOKEN;
  const templateName = "account_created_utility_v1_20260822210848";

  const payload = {
    recipient_mobile_number: normalizeWhatsAppNumber(phone),
    messages: [
      {
        kind: "template",
        template: {
          name: templateName,
          language: "en_US",
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: "TestUser" },
                { type: "text", text: param2 }
              ],
            },
          ],
        },
      },
    ],
  };

  console.log(`\nTesting param2: "${param2}"...`);
  const res = await fetch(CHATMITRA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("Result:", text);
}

async function main() {
  const phone = "9902262397";
  await sendParamTest(phone, "vksautoservices.org");
  await sendParamTest(phone, "https://vksautoservices.org");
  await sendParamTest(phone, "vksautoservices");
}

main().catch(console.error);
