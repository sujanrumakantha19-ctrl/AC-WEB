const CHATMITRA_API_URL = "https://backend.chatmitra.com/developer/api/send_message";

export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export async function sendWhatsAppWelcomeMessage(name: string, phone: string, groupLink = ""): Promise<void> {
  const token = process.env.CHATMITRA_API_TOKEN;
  if (!token) {
    console.warn("[whatsapp] CHATMITRA_API_TOKEN not set; skipping welcome message");
    return;
  }

  const templateName = process.env.CHATMITRA_WELCOME_TEMPLATE_NAME || "account_welcome_v1";
  const firstName = name.trim().split(/\s+/)[0] || name;

  const parameters: { type: string; text: string }[] = [{ type: "text", text: firstName }];
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
          language: process.env.CHATMITRA_WELCOME_TEMPLATE_LANGUAGE || "en_US",
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

  try {
    const res = await fetch(CHATMITRA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[whatsapp] ChatMitra send failed", res.status, text);
    }
  } catch (err) {
    console.error("[whatsapp] ChatMitra send error", err);
  }
}

export async function sendWhatsAppAuctionReminderMessage(
  name: string,
  phone: string,
  vehicleTitle: string,
  startTime: string,
  auctionUrl = "https://vksautoservices.org/auctions"
): Promise<void> {
  const token = process.env.CHATMITRA_API_TOKEN;
  if (!token) {
    console.warn("[whatsapp] CHATMITRA_API_TOKEN not set; skipping auction reminder");
    return;
  }

  const templateName = process.env.CHATMITRA_REMINDER_TEMPLATE_NAME || "auction_reminder_v1";
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
          language: process.env.CHATMITRA_REMINDER_TEMPLATE_LANGUAGE || "en_US",
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

  try {
    const res = await fetch(CHATMITRA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[whatsapp] ChatMitra auction reminder failed", res.status, text);
    }
  } catch (err) {
    console.error("[whatsapp] ChatMitra auction reminder error", err);
  }
}
