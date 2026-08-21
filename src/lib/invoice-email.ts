import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Auction from "@/models/Auction";
import User from "@/models/User";
import { notifyAdmins } from "@/lib/auction-notifications";
import { generatePaymentInvoicePdf } from "@/lib/invoice-pdf";
import { sendPaymentInvoiceEmail } from "@/lib/email";

interface InvoicePayment {
  _id: unknown;
  orderId: string;
  receipt?: string;
  paymentId?: string;
  amount: number;
  currency: string;
  createdAt: Date;
  invoiceSentAt?: Date;
  user: unknown;
  auction: unknown;
}

interface InvoiceAuction {
  _id: unknown;
  title: string;
  lotNumber?: string;
  location?: string;
}

interface InvoiceUser {
  _id: unknown;
  name: string;
  cusId?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/**
 * Sends the payment receipt (invoice) PDF for a confirmed payment to the
 * customer's registered email address.
 *
 * Idempotent: guarded by the payment's `invoiceSentAt` flag so a receipt is
 * never emailed more than once, even if multiple code paths (real-time
 * verification, order reconciliation, and the payment-status cron) observe the
 * same PAID transition.
 *
 * Never throws — email failures are logged and surfaced to admins without
 * breaking the payment flow.
 */
export async function sendInvoiceForPayment(
  payment:
    | {
        _id?: unknown;
        orderId?: string;
        receipt?: string;
        amount?: number;
        currency?: string;
        createdAt?: Date;
        invoiceSentAt?: Date;
        user?: unknown;
        auction?: unknown;
      }
    | null
    | undefined
): Promise<boolean> {
  if (!payment?._id) return false;
  if (payment.invoiceSentAt) return false;

  await dbConnect();

  const record = (await Payment.findById(payment._id).lean()) as unknown as InvoicePayment | null;
  if (!record) return false;
  if (record.invoiceSentAt) return false;

  const auction = (await Auction.findById(record.auction)
    .select("title lotNumber location")
    .lean()) as unknown as InvoiceAuction | null;
  const user = (await User.findById(record.user)
    .select("name cusId phone email addressLine1 addressLine2 city state country pincode")
    .lean()) as unknown as InvoiceUser | null;
  if (!user?.email) {
    console.warn("[invoice-email] no registered email; skipping invoice for", record._id);
    return false;
  }

  const invoiceNo =
    record.receipt ||
    record.orderId ||
    `INV-${String(record._id).slice(-8).toUpperCase()}`;

  const address = [user.addressLine1, user.addressLine2, user.city, user.state, user.pincode]
    .filter(Boolean)
    .join(", ");

  try {
    const pdfBuffer = await generatePaymentInvoicePdf({
      invoiceNo,
      date: record.createdAt || new Date(),
      customer: {
        name: user.name || "",
        cusId: user.cusId,
        phone: user.phone,
        email: user.email,
        address: address || undefined,
      },
      auction: auction
        ? {
            lotNumber: auction.lotNumber,
            title: auction.title,
            location: auction.location,
          }
        : null,
      description: `Auction Registration Fee${auction ? ` — ${auction.title}` : ""}`,
      amount: record.amount || 0,
      currency: record.currency || "INR",
      reference: record.paymentId ? `Razorpay Payment: ${record.paymentId}` : undefined,
    });

    await sendPaymentInvoiceEmail({
      to: user.email,
      pdfBuffer,
      fileName: `${invoiceNo}.pdf`,
    });
  } catch (err) {
    console.error("[invoice-email] failed to email invoice for", record._id, err);
    try {
      await notifyAdmins(
        "Invoice email failed",
        `Could not email the payment receipt (${invoiceNo}) to ${user.name} (${user.cusId || String(user._id)}) for auction "${auction?.title || "N/A"}". Reason: ${err instanceof Error ? err.message : "unknown error"}`,
        auction ? String(auction._id) : undefined
      );
    } catch {
      // notification failure must not mask the original error
    }
    return false;
  }

  await Payment.updateOne(
    { _id: record._id },
    { $set: { invoiceSentAt: new Date(), updatedAt: new Date() } }
  );
  return true;
}