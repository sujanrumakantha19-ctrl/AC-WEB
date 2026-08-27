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

async function testWithLang(phone, lang) {
  const token = process.env.CHATMITRA_API_TOKEN;
  const templateName = "account_created_utility_v1_20260822210848";

  const payload = {
    recipient_mobile_number: normalizeWhatsAppNumber(phone),
    messages: [
      {
        kind: "template",
        template: {
          name: templateName,
          language: lang,
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: "TestUser" },
                { type: "text", text: "https://vksautoservices.org" }
              ],
            },
          ],
        },
      },
    ],
  };

  console.log(`\nTesting ${phone} with lang=${lang}...`);
  const res = await fetch(CHATMITRA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`Lang [${lang}] Response:`, text);
}

async function run() {
  const target = "9902262397";
  await testWithLang(target, "en");
  await testWithLang(target, "en_US");
}

run().catch(console.error);
