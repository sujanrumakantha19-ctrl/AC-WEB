import fs from 'fs';
import path from 'path';

async function getApprovedTemplates() {
  const token = process.env.CHATMITRA_API_TOKEN;
  const res = await fetch("https://backend.chatmitra.com/developer/api/templates", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("Chatmitra Approved Templates List:", JSON.stringify(data, null, 2));
}

// Parse .env.local directly
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
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

async function sendWelcome(name, phone, groupLink = "") {
  const token = process.env.CHATMITRA_API_TOKEN;
  const templateName = "account_welcome_v1_20260819151520";
  const firstName = name.trim().split(/\s+/)[0] || name;

  const parameters = [{ type: "text", text: firstName }];
  if (groupLink) {
    parameters.push({ type: "text", text: groupLink });
  }

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
              parameters,
            },
          ],
        },
      },
    ],
  };

  console.log(`Sending Welcome Message to ${phone} using template ${templateName}...`);
  const res = await fetch(CHATMITRA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("Welcome Response Status:", res.status);
  console.log("Welcome Response Body:", text);
}

async function sendReminder(name, phone, vehicleTitle, startTime, auctionUrl = "https://vksautoservices.org/auctions") {
  const token = process.env.CHATMITRA_API_TOKEN;
  const templateName = "auction_reminder_v1_20260819153142";
  const firstName = name.trim().split(/\s+/)[0] || name;

  const parameters = [
    { type: "text", text: firstName },
    { type: "text", text: vehicleTitle },
    { type: "text", text: startTime },
    { type: "text", text: auctionUrl }
  ];

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
              parameters,
            },
          ],
        },
      },
    ],
  };

  console.log(`Sending Reminder Message to ${phone} using template ${templateName}...`);
  const res = await fetch(CHATMITRA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("Reminder Response Status:", res.status);
  console.log("Reminder Response Body:", text);
}

async function run() {
  await getApprovedTemplates();
  const numbers = ["6369455056", "9902262397", "9902262307"];
  for (const num of numbers) {
    console.log(`\n================ Testing ${num} ================`);
    await sendWelcome("Sujan", num, "https://vksautoservices.org");
    await sendReminder("Sujan", num, "2022 Hyundai Creta SX", "03:00 PM Today");
  }
}

run();
