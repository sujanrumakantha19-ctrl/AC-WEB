"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetAuctionQuery, usePayAccessMutation } from "@/services/auctions-api";
import { useGetRegistrationFeeQuery } from "@/services/settings-api";
import { errorMessage } from "@/lib/helpers";

const DEFAULT_FEE = 500;

type Razorpay = {
  open: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => Razorpay;
  }
}

export default function RegistrationFeePaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [auctionId, setAuctionId] = useState("");
  const [transactionId, setTransactionId] = useState(() => "BAU" + Date.now().toString().slice(-10));
  const razorpayLoaded = useRef(false);

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect) {
      const id = redirect.split("/").pop() || "";
      setAuctionId(id);
    }
  }, []);

  const { data: auctionData } = useGetAuctionQuery(auctionId, { skip: !auctionId });
  const { data: feeData } = useGetRegistrationFeeQuery();
  const [payAccess, { isLoading: payAccessLoading }] = usePayAccessMutation();

  const auction = auctionData?.auction;
  const auctionTitle = auction?.title || "";
  const auctionFee = auction?.registrationFee || 0;
  const settingFee = feeData?.value ? parseInt(feeData.value) : NaN;
  const registrationFee =
    auctionFee || (!isNaN(settingFee) && settingFee > 0 ? settingFee : DEFAULT_FEE);
  const totalAmount = registrationFee;
  const loading = (!!auctionId && !auctionData) || !feeData;

  const loadRazorpayScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (razorpayLoaded.current || window.Razorpay) {
        razorpayLoaded.current = true;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        razorpayLoaded.current = true;
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load payment gateway"));
      document.body.appendChild(script);
    });
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentError("");
    try {
      let orderData: any;
      try {
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auctionId }),
        });
        orderData = await orderRes.json();
      } catch {
        orderData = {};
      }

      if (!auctionId) {
        throw new Error("Auction reference missing. Please try again from the auction page.");
      }

      if (!orderData?.success) {
        throw new Error(orderData?.error || "Could not create payment order");
      }

      if (orderData.alreadyPaid) {
        setIsProcessing(false);
        setPaymentSuccess(true);
        return;
      }

      await loadRazorpayScript();

      const userData = orderData?.customer || {};
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency || "INR",
        name: "VKS Autoservices",
        description: `Registration Fee${auctionTitle ? ` — ${auctionTitle}` : ""}`,
        order_id: orderData.orderId,
        prefill: {
          name: userData.name || "",
          email: userData.email || "",
          contact: userData.phone || "",
        },
        handler: async (response) => {
          try {
            setTransactionId("BAU" + Date.now().toString().slice(-10));
            await payAccess({
              auctionId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }).unwrap();
            setIsProcessing(false);
            setPaymentSuccess(true);
          } catch (err) {
            setPaymentError(errorMessage(err, "Payment could not be verified. Please try again."));
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      };

      const rzp = new window.Razorpay!(options);
      rzp.open();
    } catch (err) {
      setPaymentError(errorMessage(err, "Payment could not be completed. Please try again."));
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl flex items-center justify-center min-h-[300px]">
        <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-on-surface">
            Welcome to VKS Autoservices! 🎉
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Your registration is complete. Happy Browsing!
          </p>
        </div>

        <div className="bg-surface-container-low rounded-xl p-5 space-y-3 text-left">
          <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <p className="text-xs font-bold text-on-surface">Payment Successful</p>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Transaction ID</span>
            <span className="font-bold text-on-surface font-mono">{transactionId}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Date & Time</span>
            <span className="font-bold text-on-surface">
              {new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Amount Paid</span>
            <span className="font-extrabold text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Payment Method</span>
            <span className="font-bold text-on-surface">UPI</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Status</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="material-symbols-outlined text-sm">verified</span>
              Success
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => router.push(`/user/live/${auctionId}`)}
            className="w-full py-3 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">gavel</span>
            Enter Auction Room
          </button>
          <p className="text-[10px] text-on-surface-variant">Go and place your offer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-11 h-11 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
        </div>
        <h1 className="text-xl font-extrabold text-on-surface">Pay Registration Fee</h1>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          {auctionTitle
            ? `Pay the registration fee to unlock live offers for ${auctionTitle}.`
            : "Pay the registration fee to become a verified buyer and start offering."}
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-surface-container-low rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-on-surface">Fee Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">verified</span>
                <span className="text-xs text-on-surface-variant">Registration Fee</span>
              </div>
              <span className="text-sm font-bold text-on-surface">₹{registrationFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="border-t border-outline-variant/30 pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-on-surface">Total Payable</span>
              <span className="text-lg font-extrabold text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {paymentError && (
          <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-xs font-medium text-error">
            {paymentError}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isProcessing || payAccessLoading}
          className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing || payAccessLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              Processing Payment...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">lock</span>
              Pay
            </>
          )}
        </button>

        <Link href="/user/auctions" className="block text-center text-xs text-on-surface-variant hover:text-primary transition-colors">
          ← Back to Auctions
        </Link>
      </div>
    </div>
  );
}
