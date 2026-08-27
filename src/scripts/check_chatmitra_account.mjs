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

async function getAccountInfo() {
  const token = process.env.CHATMITRA_API_TOKEN;
  console.log("Fetching ChatMitra account / sender phone info...");

  const res = await fetch("https://backend.chatmitra.com/developer/api/account", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const text = await res.text();
  console.log("Account Response:", text);

  const res2 = await fetch("https://backend.chatmitra.com/developer/api/phone_numbers", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const text2 = await res2.text();
  console.log("Phone Numbers Response:", text2);
}

getAccountInfo().catch(console.error);
