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

async function checkTemplates() {
  const token = process.env.CHATMITRA_API_TOKEN;
  console.log("Fetching templates from ChatMitra...");
  const res = await fetch("https://backend.chatmitra.com/developer/api/templates", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("=== CHATMITRA APPROVED TEMPLATES ===");
  console.log(JSON.stringify(data, null, 2));
}

checkTemplates().catch(console.error);
