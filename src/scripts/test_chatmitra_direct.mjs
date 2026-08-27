import { sendWhatsAppWelcomeMessage } from "../lib/whatsapp.js";

async function test() {
  console.log("Testing ChatMitra Welcome Message for 9902262397...");
  await sendWhatsAppWelcomeMessage("Test User", "9902262397", "Contact Admin");
  console.log("Done calling sendWhatsAppWelcomeMessage");
}

test().catch(console.error);
