import nodemailer from "nodemailer";
import crypto from "crypto";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_SECURE = process.env.SMTP_SECURE !== "false";
const SMTP_USER = process.env.SMTP_USER || "sujanrumakantha19@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "mveajivirjuurcza";

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE, // true for port 465, false for 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Cache to prevent duplicate email dispatches (60-second sliding window)
const recentDispatches = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 60 * 1000;

function cleanupDeduplicationCache() {
  const now = Date.now();
  for (const [key, timestamp] of recentDispatches.entries()) {
    if (now - timestamp > DEDUPLICATION_WINDOW_MS) {
      recentDispatches.delete(key);
    }
  }
}

/**
 * Validates whether an email address is valid, non-empty, and correctly formatted.
 */
export function isValidEmailAddress(email?: unknown): email is string {
  if (typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  if (!clean || clean.length < 5 || clean.length > 254) return false;
  if (clean === "undefined" || clean === "null" || clean === "admin") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(clean);
}

/**
 * Core guarded email dispatcher that ensures:
 * 1. Recipient email is non-empty and valid.
 * 2. Email subject and HTML body are non-empty.
 * 3. Identical emails (same recipient, subject, content) are deduplicated within a 60s window.
 */
async function sendGuardedMail(options: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}): Promise<boolean> {
  const recipient = (options.to || "").trim().toLowerCase();

  // 1. Validate recipient
  if (!isValidEmailAddress(recipient)) {
    console.warn(`[email] Skipped sending: invalid or empty recipient email "${options.to}"`);
    return false;
  }

  // 2. Validate subject and body content
  if (!options.subject || !options.subject.trim()) {
    console.warn(`[email] Skipped sending to ${recipient}: empty subject`);
    return false;
  }
  if (!options.html || !options.html.trim() || options.html.trim().length < 20) {
    console.warn(`[email] Skipped sending to ${recipient}: empty or invalid HTML body`);
    return false;
  }

  // 3. Deduplication check
  cleanupDeduplicationCache();
  const hash = crypto
    .createHash("sha256")
    .update(`${recipient}:${options.subject}:${options.html}:${options.attachments?.length || 0}`)
    .digest("hex");

  const lastSent = recentDispatches.get(hash);
  if (lastSent && Date.now() - lastSent < DEDUPLICATION_WINDOW_MS) {
    console.warn(`[email] Duplicate email suppressed for ${recipient} ("${options.subject}")`);
    return false;
  }

  // Record dispatch key
  recentDispatches.set(hash, Date.now());

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"VKS Autoservices" <owner@vksautoserviceauctions.com>',
      to: recipient,
      subject: options.subject,
      html: options.html,
      ...(options.attachments ? { attachments: options.attachments } : {}),
    });
    return true;
  } catch (error) {
    // Unset on error so retries can proceed if needed
    recentDispatches.delete(hash);
    console.error(`[email] SMTP delivery failed to ${recipient}:`, error);
    throw error;
  }
}

/**
 * Emails a 6-digit password reset OTP to a customer.
 */
export async function sendResetOtpEmail({
  to,
  name,
  otp,
}: {
  to: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  if (!otp || typeof otp !== "string" || otp.trim().length === 0) {
    console.warn("[email] Cannot send password reset email: empty OTP");
    return false;
  }

  const cleanName = (name || "Member").trim();
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #f7f9fc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #00355f; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VKS AUTOSERVICES</h2>
        <p style="color: #42474f; font-size: 12px; margin-top: 4px; font-weight: 600;">Premium Automotive Auction Platform</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);">
        <h3 style="color: #191c1e; font-size: 18px; margin-top: 0; font-weight: 700;">Password Reset Verification</h3>
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">Hello <strong>${cleanName}</strong>,</p>
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">We received a request to reset your password for your VKS Autoservices account. Use the 6-digit OTP verification code below to set your new password:</p>

        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background-color: #00355f; color: #ffffff; font-size: 32px; font-weight: 800; tracking: 6px; padding: 14px 36px; border-radius: 12px; font-family: monospace; letter-spacing: 6px;">
            ${otp.trim()}
          </div>
          <p style="color: #727780; font-size: 12px; margin-top: 10px;">This code is valid for <strong>15 minutes</strong>.</p>
        </div>

        <p style="color: #727780; font-size: 12px; line-height: 1.5; margin-bottom: 0;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #727780; font-size: 11px;">
        &copy; ${new Date().getFullYear()} VKS Autoservices. All rights reserved.
      </div>
    </div>
  `;

  return sendGuardedMail({
    to,
    subject: `Your Password Reset Verification Code: ${otp.trim()} - VKS Autoservices`,
    html: htmlContent,
  });
}

/**
 * Emails a payment receipt / invoice (PDF attachment) to a customer.
 * Sent automatically right after a registration-fee payment is confirmed.
 */
export async function sendPaymentInvoiceEmail({
  to,
  pdfBuffer,
  fileName,
}: {
  to: string;
  pdfBuffer: Buffer;
  fileName: string;
}): Promise<boolean> {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    console.warn("[email] Cannot send invoice email: empty PDF buffer attachment");
    return false;
  }

  const safeFileName = fileName?.trim() || "Payment-Invoice.pdf";
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #f7f9fc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #00355f; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VKS AUTOSERVICES</h2>
        <p style="color: #42474f; font-size: 12px; margin-top: 4px; font-weight: 600;">Premium Automotive Auction Platform</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);">
        <h3 style="color: #191c1e; font-size: 20px; margin-top: 0; font-weight: 800;">Payment Invoice Attached 📄</h3>
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">Thank you for your payment. Please find your official payment invoice attached to this email.</p>

        <p style="color: #727780; font-size: 12px; line-height: 1.5; margin-bottom: 0;">If you have any questions or require support, reach out to us at owner@vksautoserviceauctions.com, WhatsApp us at 95971 77351, or call us at 9003991351.</p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #727780; font-size: 11px;">
        &copy; ${new Date().getFullYear()} VKS Autoservices. All rights reserved.
      </div>
    </div>
  `;

  return sendGuardedMail({
    to,
    subject: `Your Payment Receipt ${safeFileName.replace(/[^\d]/g, "") ? `(${safeFileName.replace(/[^\d]/g, "")})` : ""} - VKS Autoservices`,
    html: htmlContent,
    attachments: [
      {
        filename: safeFileName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

/**
 * Emails a congratulations notice to the winner of an auction or parking sale.
 */
export async function sendWinnerCongratulationsEmail({
  to,
  customerName,
  auctionName,
  winningAmount,
  endedAt,
  saleType = "Auction",
  itemDetails,
}: {
  to: string;
  customerName: string;
  auctionName: string;
  winningAmount: string;
  endedAt: string;
  saleType?: string;
  itemDetails?: string;
}): Promise<boolean> {
  const cleanCustomer = (customerName || "Customer").trim();
  const cleanAuction = (auctionName || "Auction Item").trim();
  const cleanAmount = (winningAmount || "—").trim();

  if (!cleanAuction || cleanAuction === "—") {
    console.warn("[email] Cannot send winner congratulations email: empty auction name");
    return false;
  }

  const detailRow = (label: string, value: string) => `
    <tr>
      <td style="padding: 10px 0; color: #727780; font-size: 12px; font-weight: 600; width: 40%;">${label}</td>
      <td style="padding: 10px 0; color: #191c1e; font-size: 13px; font-weight: 700;">${value}</td>
    </tr>
  `;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #f7f9fc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #00355f; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VKS AUTOSERVICES</h2>
        <p style="color: #42474f; font-size: 12px; margin-top: 4px; font-weight: 600;">Premium Automotive Auction Platform</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);">
        <h3 style="color: #191c1e; font-size: 20px; margin-top: 0; font-weight: 800;">Congratulations! You Won 🎉</h3>
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">Hello <strong>${cleanCustomer}</strong>, your offer was confirmed as the winning offer for <strong>${cleanAuction}</strong>.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-top: 1px solid #eef1f5; border-bottom: 1px solid #eef1f5;">
          ${detailRow("Customer Name", cleanCustomer)}
          ${detailRow(`${saleType} Name`, cleanAuction)}
          ${itemDetails ? detailRow("Item / Property Details", itemDetails) : ""}
          ${detailRow("Winning Amount", cleanAmount)}
          ${detailRow("Ended On", endedAt || new Date().toLocaleDateString("en-IN"))}
        </table>

        <p style="color: #727780; font-size: 12px; line-height: 1.5; margin-bottom: 0;">Our team will reach out to you shortly with the next steps for completing your purchase. For any queries, contact us at owner@vksautoserviceauctions.com, WhatsApp 95971 77351, or call 9003991351.</p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #727780; font-size: 11px;">
        &copy; ${new Date().getFullYear()} VKS Autoservices. All rights reserved.
      </div>
    </div>
  `;

  return sendGuardedMail({
    to,
    subject: `Congratulations! You Won the ${saleType} - ${cleanAuction} | VKS Autoservices`,
    html: htmlContent,
  });
}

/**
 * Emails a refund initiated notice to a customer when their deposit refund
 * is initiated for an ended auction.
 */
export async function sendRefundInitiatedEmail({
  to,
  customerName,
  auctionTitle,
  amount = "₹499",
  refundId,
  date,
}: {
  to: string;
  customerName: string;
  auctionTitle: string;
  amount?: string;
  refundId?: string;
  date?: string;
}): Promise<boolean> {
  const cleanCustomer = (customerName || "Customer").trim();
  const cleanTitle = (auctionTitle || "Auction Deposit").trim();
  const cleanAmount = (amount || "₹499").trim();

  const detailRow = (label: string, value: string) => `
    <tr>
      <td style="padding: 10px 0; color: #727780; font-size: 12px; font-weight: 600; width: 40%;">${label}</td>
      <td style="padding: 10px 0; color: #191c1e; font-size: 13px; font-weight: 700;">${value}</td>
    </tr>
  `;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #f7f9fc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #00355f; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VKS AUTOSERVICES</h2>
        <p style="color: #42474f; font-size: 12px; margin-top: 4px; font-weight: 600;">Premium Automotive Auction Platform</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);">
        <h3 style="color: #191c1e; font-size: 20px; margin-top: 0; font-weight: 800;">Refund Initiated ⏳</h3>
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">Hello <strong>${cleanCustomer}</strong>, your registration deposit refund for <strong>${cleanTitle}</strong> has been initiated and is now being processed.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-top: 1px solid #eef1f5; border-bottom: 1px solid #eef1f5;">
          ${detailRow("Customer Name", cleanCustomer)}
          ${detailRow("Auction / Sale", cleanTitle)}
          ${detailRow("Refund Amount", `${cleanAmount} (Deposit)`)}
          ${refundId ? detailRow("Refund Reference", refundId) : ""}
          ${detailRow("Initiated Date", date || new Date().toLocaleDateString("en-IN"))}
        </table>

        <div style="background-color: #fef8ee; border: 1px solid #fae1b8; padding: 12px 16px; border-radius: 10px; margin: 16px 0;">
          <p style="color: #8c5303; font-size: 12px; margin: 0; line-height: 1.5;">
            <strong>Note:</strong> The ₹499 base registration fee deposit is being refunded to your original payment method. The 18% GST (₹89) is non-refundable per auction rules.
          </p>
        </div>

        <p style="color: #727780; font-size: 12px; line-height: 1.5; margin-bottom: 0;">Once processed by your bank/UPI provider, you will receive a confirmation email when the funds reflect. For queries, contact us at owner@vksautoserviceauctions.com, WhatsApp 95971 77351, or call 9003991351.</p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #727780; font-size: 11px;">
        &copy; ${new Date().getFullYear()} VKS Autoservices. All rights reserved.
      </div>
    </div>
  `;

  return sendGuardedMail({
    to,
    subject: `Refund Initiated: Registration Deposit for ${cleanTitle} - VKS Autoservices`,
    html: htmlContent,
  });
}

/**
 * Emails a refund confirmation notice to a customer when Razorpay confirms
 * their refund has been successfully credited to their payment method.
 */
export async function sendRefundConfirmationEmail({
  to,
  customerName,
  auctionTitle,
  amount,
  refundId,
  date,
}: {
  to: string;
  customerName: string;
  auctionTitle: string;
  amount: string;
  refundId?: string;
  date?: string;
}): Promise<boolean> {
  const cleanCustomer = (customerName || "Customer").trim();
  const cleanTitle = (auctionTitle || "Auction Deposit").trim();
  const cleanAmount = (amount || "—").trim();

  const detailRow = (label: string, value: string) => `
    <tr>
      <td style="padding: 10px 0; color: #727780; font-size: 12px; font-weight: 600; width: 40%;">${label}</td>
      <td style="padding: 10px 0; color: #191c1e; font-size: 13px; font-weight: 700;">${value}</td>
    </tr>
  `;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #f7f9fc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #00355f; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VKS AUTOSERVICES</h2>
        <p style="color: #42474f; font-size: 12px; margin-top: 4px; font-weight: 600;">Premium Automotive Auction Platform</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);">
        <h3 style="color: #191c1e; font-size: 20px; margin-top: 0; font-weight: 800;">Refund Credited Successfully 💸</h3>
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">Hello <strong>${cleanCustomer}</strong>, your deposit refund for <strong>${cleanTitle}</strong> has been successfully credited back to your original payment method.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-top: 1px solid #eef1f5; border-bottom: 1px solid #eef1f5;">
          ${detailRow("Customer Name", cleanCustomer)}
          ${detailRow("Auction / Sale", cleanTitle)}
          ${detailRow("Refunded Amount", cleanAmount)}
          ${refundId ? detailRow("Refund Reference", refundId) : ""}
          ${date ? detailRow("Confirmed Date", date) : ""}
        </table>

        <p style="color: #727780; font-size: 12px; line-height: 1.5; margin-bottom: 0;">Depending on your bank or card issuer, the credited amount will reflect on your statement within 1–3 business days. If you have any questions, reach out to us at owner@vksautoserviceauctions.com, WhatsApp 95971 77351, or call 9003991351.</p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #727780; font-size: 11px;">
        &copy; ${new Date().getFullYear()} VKS Autoservices. All rights reserved.
      </div>
    </div>
  `;

  return sendGuardedMail({
    to,
    subject: `Refund Confirmation: Deposit for ${cleanTitle} Credited - VKS Autoservices`,
    html: htmlContent,
  });
}
