import nodemailer from "nodemailer";

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

export async function sendResetOtpEmail({
  to,
  name,
  otp,
}: {
  to: string;
  name: string;
  otp: string;
}) {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #f7f9fc; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #00355f; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VKS AUTOSERVICES</h2>
        <p style="color: #42474f; font-size: 12px; margin-top: 4px; font-weight: 600;">Premium Automotive Auction Platform</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);">
        <h3 style="color: #191c1e; font-size: 18px; margin-top: 0; font-weight: 700;">Password Reset Verification</h3>
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">We received a request to reset your password for your VKS Autoservices account. Use the 6-digit OTP verification code below to set your new password:</p>

        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background-color: #00355f; color: #ffffff; font-size: 32px; font-weight: 800; tracking: 6px; padding: 14px 36px; border-radius: 12px; font-family: monospace; letter-spacing: 6px;">
            ${otp}
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

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"VKS Autoservices" <owner@vksautoserviceauctions.com>',
    to,
    subject: `Your Password Reset Verification Code: ${otp} - VKS Autoservices`,
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
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"VKS Autoservices" <owner@vksautoserviceauctions.com>',
    to,
    subject: `Your Payment Receipt ${fileName.replace(/[^\d]/g, "") ? `(${fileName.replace(/[^\d]/g, "")})` : ""} - VKS Autoservices`,
    html: `
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
    `,
    attachments: [
      {
        filename: fileName,
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
}) {
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
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">Hello <strong>${customerName}</strong>, your offer was confirmed as the winning offer for <strong>${auctionName}</strong>.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-top: 1px solid #eef1f5; border-bottom: 1px solid #eef1f5;">
          ${detailRow("Customer Name", customerName)}
          ${detailRow(`${saleType} Name`, auctionName)}
          ${itemDetails ? detailRow("Item / Property Details", itemDetails) : ""}
          ${detailRow("Winning Amount", winningAmount)}
          ${detailRow("Ended On", endedAt)}
        </table>

        <p style="color: #727780; font-size: 12px; line-height: 1.5; margin-bottom: 0;">Our team will reach out to you shortly with the next steps for completing your purchase. For any queries, contact us at owner@vksautoserviceauctions.com, WhatsApp 95971 77351, or call 9003991351.</p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #727780; font-size: 11px;">
        &copy; ${new Date().getFullYear()} VKS Autoservices. All rights reserved.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"VKS Autoservices" <owner@vksautoserviceauctions.com>',
    to,
    subject: `Congratulations! You Won the ${saleType} - ${auctionName} | VKS Autoservices`,
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
}) {
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
        <p style="color: #42474f; font-size: 14px; line-height: 1.6;">Hello <strong>${customerName}</strong>, your deposit refund for <strong>${auctionTitle}</strong> has been successfully credited back to your original payment method.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-top: 1px solid #eef1f5; border-bottom: 1px solid #eef1f5;">
          ${detailRow("Customer Name", customerName)}
          ${detailRow("Auction / Sale", auctionTitle)}
          ${detailRow("Refunded Amount", amount)}
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

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"VKS Autoservices" <owner@vksautoserviceauctions.com>',
    to,
    subject: `Refund Confirmation: Deposit for ${auctionTitle} Credited - VKS Autoservices`,
    html: htmlContent,
  });
}
