import PDFDocument from "pdfkit";
import { SITE_CONFIG } from "@/config/site";

export interface InvoicePdfInput {
  invoiceNo: string;
  date: Date;
  customer: {
    name: string;
    cusId?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  auction?: {
    lotNumber?: string;
    title?: string;
    location?: string;
  } | null;
  description: string;
  amount: number;
  currency?: string;
  reference?: string;
}

const inr = (n: number) =>
  `Rs. ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Builds a styled payment receipt / invoice as a PDF buffer.
 *
 * NOTE: PDFKit's built-in Helvetica fonts use the WinAnsi encoding, which
 * cannot render the rupee symbol (U+20B9), so amounts are labelled "Rs.".
 */
export function generatePaymentInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 48, size: "A4" });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 48;
      const rightX = pageWidth - margin;
      const contentWidth = rightX - margin;

      // ── Header band ──
      doc.rect(0, 0, pageWidth, 86).fill("#00355f");
      doc.fill("#ffffff").fontSize(20).font("Helvetica-Bold").text("VKS AUTOSERVICES", margin, 26);
      doc
        .fill("#cfe3f2")
        .fontSize(9)
        .font("Helvetica")
        .text("Premium Automotive Auction Platform", margin, 52);
      doc
        .fill("#ffffff")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("PAYMENT RECEIPT / INVOICE", rightX, 30, { align: "right", width: 150 });

      // ── Invoice meta ──
      const metaTop = 110;
      doc
        .fill("#191c1e")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Invoice No.", margin, metaTop);
      doc
        .fill("#42474f")
        .font("Helvetica")
        .text(input.invoiceNo, margin, metaTop + 14);

      doc
        .fill("#191c1e")
        .font("Helvetica-Bold")
        .text("Date", rightX, metaTop, { align: "right" });
      doc
        .fill("#42474f")
        .font("Helvetica")
        .text(
          new Date(input.date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          rightX,
          metaTop + 14,
          { align: "right" }
        );

      if (input.reference) {
        doc
          .fill("#191c1e")
          .font("Helvetica-Bold")
          .text("Reference", margin, metaTop + 44);
        doc.fill("#42474f").font("Helvetica").text(input.reference, margin, metaTop + 58);
      }

      // ── Billed to ──
      let y = metaTop + 92;
      doc
        .fill("#00355f")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("BILLED TO", margin, y);
      y += 16;
      doc
        .fill("#191c1e")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(input.customer.name || "—", margin, y);
      y += 16;

      const customerLines = [
        input.customer.cusId ? `Customer ID: ${input.customer.cusId}` : "",
        input.customer.phone ? `Phone: ${input.customer.phone}` : "",
        input.customer.email ? `Email: ${input.customer.email}` : "",
        input.customer.address ? `Address: ${input.customer.address}` : "",
      ].filter(Boolean);

      doc
        .fill("#42474f")
        .fontSize(9)
        .font("Helvetica")
        .text(customerLines.join("\n"), margin, y, {
          lineGap: 2,
        });
      y += customerLines.length * 13 + 8;

      // ── Auction details ──
      if (input.auction?.title) {
        doc
          .fill("#00355f")
          .fontSize(9)
          .font("Helvetica-Bold")
          .text("AUCTION", margin, y);
        y += 16;
        const auctionLines = [
          input.auction.lotNumber ? `Lot: ${input.auction.lotNumber}` : "",
          input.auction.title,
          input.auction.location ? `Location: ${input.auction.location}` : "",
        ].filter(Boolean);
        doc
          .fill("#42474f")
          .fontSize(9)
          .font("Helvetica")
          .text(auctionLines.join("\n"), margin, y, { lineGap: 2 });
        y += auctionLines.length * 13 + 10;
      }

      // ── Table header ──
      const tableTop = Math.max(y + 12, metaTop + 220);
      const colDesc = margin;
      const colAmountRight = rightX;

      doc.rect(margin, tableTop - 8, contentWidth, 22).fill("#eef3f8");
      doc
        .fill("#00355f")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("DESCRIPTION", colDesc, tableTop);
      doc
        .fill("#00355f")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("AMOUNT", colAmountRight, tableTop, { align: "right" });

      // ── Table rows (Itemized with 18% GST) ──
      const totalAmount = Number(input.amount) || 0;
      const baseFee = totalAmount > 10 ? Number((totalAmount / 1.18).toFixed(2)) : totalAmount;
      const gstAmount = totalAmount > 10 ? Number((totalAmount - baseFee).toFixed(2)) : 0;

      let rowTop = tableTop + 26;
      doc
        .fill("#191c1e")
        .fontSize(10)
        .font("Helvetica")
        .text("Auction Registration Deposit (Refundable)", colDesc, rowTop);
      doc
        .fill("#191c1e")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(inr(baseFee), colAmountRight, rowTop, { align: "right" });

      if (gstAmount > 0) {
        rowTop += 22;
        doc
          .fill("#191c1e")
          .fontSize(10)
          .font("Helvetica")
          .text("Goods & Services Tax (18% GST - Non-refundable)", colDesc, rowTop);
        doc
          .fill("#191c1e")
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(inr(gstAmount), colAmountRight, rowTop, { align: "right" });
      }

      doc.moveTo(margin, rowTop + 20).lineTo(rightX, rowTop + 20).strokeColor("#dde3ea").lineWidth(1).stroke();

      // ── Total ──
      const totalTop = rowTop + 34;
      doc
        .fill("#191c1e")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Total Paid", colDesc, totalTop);
      doc
        .fill("#00355f")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(inr(totalAmount), colAmountRight, totalTop - 2, { align: "right" });

      doc
        .fill("#727780")
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Amount in ${(input.currency || "INR").toUpperCase()} · ${inr(totalAmount)} (Base deposit of ${inr(baseFee)} is refundable if not won)`,
          colDesc,
          totalTop + 22
        );

      // ── Footer ──
      const footerY = pageHeight - 110;
      doc.rect(margin, footerY - 16, contentWidth, 1).fill("#dde3ea");

      doc
        .fill("#191c1e")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("VKS Autoservices", margin, footerY);
      doc
        .fill("#42474f")
        .fontSize(8)
        .font("Helvetica")
        .text(
          [
            SITE_CONFIG.contact.address,
            `Phone: ${SITE_CONFIG.contact.phone} · Email: ${SITE_CONFIG.contact.email}`,
          ].join("\n"),
          margin,
          footerY + 16,
          { lineGap: 2 }
        );

      doc
        .fill("#727780")
        .fontSize(8)
        .font("Helvetica-Oblique")
        .text(
          "This is a computer-generated payment receipt for the auction registration fee. Refunds are governed by the platform's Refund Policy.",
          margin,
          pageHeight - 46,
          { width: contentWidth }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}